import React, { useState } from 'react';
import { View, Button, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Or your preferred picker

const API_URL = "http://YOUR_NODE_SERVER_IP:5002/upload";

export default function BackgroundRemover() {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processedImage, setProcessedImage] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const removeBackground = async () => {
        if (!image) return Alert.alert("Please select an image first");

        setLoading(true);
        const formData = new FormData();
        formData.append("image", {
            uri: image,
            name: "photo.jpg",
            type: "image/jpeg",
        });

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const json = await response.json();
            if (json.success) {
                // Assuming the Python API returns hex or base64
                // If it's hex, you might need to convert it or use a library
                // Here we assume the Node bridge handles the response format
                setProcessedImage(`data:image/png;base64,${json.data.image}`);
            } else {
                Alert.alert("Error", json.error || "Failed to remove background");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Network Error", "Could not connect to the server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Pick an image from camera roll" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 20 }} />}

            <Button title="Remove Background" onPress={removeBackground} disabled={loading} />

            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {processedImage && (
                <Image
                    source={{ uri: processedImage }}
                    style={{ width: 200, height: 200, marginTop: 20, backgroundColor: '#eee' }}
                />
            )}
        </View>
    );
}
