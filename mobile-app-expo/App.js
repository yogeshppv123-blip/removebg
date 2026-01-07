import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

// --- CONFIGURATION ---
const IS_PROD = true; // Set to true for your live server
const PROD_DOMAIN = "https://api.buildora.cloud"; // Your live domain (HTTPS, no port)
const LOCAL_IP = "192.168.1.35";

const BASE_URL = IS_PROD
    ? PROD_DOMAIN
    : (Platform.OS === 'web' ? "http://localhost:5002" : `http://${LOCAL_IP}:5002`);

const API_URL = `${BASE_URL}/api/remove-bg`;

export default function BackgroundRemoverApp() {
    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your gallery to pick images.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setOriginalImage(result.assets[0].uri);
            setProcessedImage(null); // Reset result
        }
    };

    const handlesRemoveBackground = async () => {
        if (!originalImage) {
            Alert.alert("Error", "Please select an image first!");
            return;
        }

        setLoading(true);

        const formData = new FormData();

        if (Platform.OS === 'web') {
            // Web needs a real Blob/File
            const response = await fetch(originalImage);
            const blob = await response.blob();
            formData.append("image", blob, "upload.png");
        } else {
            // Mobile needs the URI object
            formData.append("image", {
                uri: originalImage,
                name: "upload.png",
                type: "image/png",
            });
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Server Error Response:", text);
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setProcessedImage(data.image); // This is the base64 string
            } else {
                Alert.alert("AI Error", data.error || "Failed to process image");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Network Error", "Could not connect to the Hostinger server. Check your connection or API URL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>AI Remover</Text>
            <Text style={styles.subtitle}>Unlimited Background Removal</Text>

            {/* Image Preview Area */}
            <View style={styles.imageCard}>
                {originalImage ? (
                    <Image source={{ uri: originalImage }} style={styles.preview} />
                ) : (
                    <View style={[styles.preview, styles.placeholder]}>
                        <Text style={styles.placeholderText}>No Image Selected</Text>
                    </View>
                )}
                <Text style={styles.label}>Original Image</Text>
            </View>

            <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
                <Text style={styles.btnText}>Select Image</Text>
            </TouchableOpacity>

            {originalImage && (
                <TouchableOpacity
                    style={[styles.processBtn, loading && styles.disabledBtn]}
                    onPress={handlesRemoveBackground}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Remove Background</Text>}
                </TouchableOpacity>
            )}

            {/* Result Area */}
            {processedImage && (
                <View style={styles.imageCard}>
                    <View style={styles.checkerboard}>
                        <Image source={{ uri: processedImage }} style={styles.preview} />
                    </View>
                    <Text style={styles.label}>Processed Result</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#0f172a',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 30,
    },
    imageCard: {
        width: width * 0.85,
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    preview: {
        width: '100%',
        height: 250,
        borderRadius: 15,
        resizeMode: 'contain',
    },
    placeholder: {
        backgroundColor: '#334155',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#64748b',
        fontWeight: '600',
    },
    checkerboard: {
        width: '100%',
        backgroundColor: 'transparent',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#334155',
        borderStyle: 'dashed',
    },
    label: {
        marginTop: 10,
        color: '#6366f1',
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: 12,
    },
    pickBtn: {
        backgroundColor: '#334155',
        width: width * 0.85,
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    processBtn: {
        backgroundColor: '#6366f1',
        width: width * 0.85,
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
