import { useState, useEffect } from "react";
import { Authenticator, Button, Heading, Flex, Text } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../amplify_outputs.json";

export default function App() {
  // State to store both Amplify and Storage.
  const [amplifyStuff, setAmplifyStuff] = useState({ Amplify: null, Storage: null });
  // State for any error that occurs while loading Amplify.
  const [amplifyError, setAmplifyError] = useState(null);
  // State for the selected file.
  const [file, setFile] = useState(null);
  // State for the upload process.
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Dynamically load and configure aws-amplify on component mount.
  useEffect(() => {
    async function loadAmplify() {
      try {
        // Dynamically import the entire aws-amplify module.
        const module = await import("aws-amplify");
        // Try to obtain the Amplify object from either a default or named export.
        const Amplify = module.Amplify || module.default;
        if (!Amplify || typeof Amplify.configure !== "function") {
          throw new Error("Amplify object is not available or misconfigured");
        }
        // Obtain the Storage export.
        const Storage = module.Storage;
        // Configure Amplify (ensure your outputs include Auth configuration).
        Amplify.configure({
          ...outputs,
          Storage: {
            AWSS3: {
              bucket: "amplify-a2app-jenny-sandb-amplifydataamplifycodege-cdjidlmwa04q", // replace with your bucket name
              region: "US East (N. Virginia) us-east-1",      // replace with your region

              customPrefix: { private: "" },
            },
          },
        });
        console.log("Amplify loaded", Amplify, Storage);
        // Save both Amplify and Storage in state.
        setAmplifyStuff({ Amplify, Storage });
      } catch (error) {
        console.error("Error loading aws-amplify:", error);
        setAmplifyError(error.message);
      }
    }
    loadAmplify();
  }, []);

  // Handler for file selection.
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadMessage(""); // Clear previous messages.
    }
  };

  // Handler for uploading the file.
  const uploadFile = async () => {
    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }
    if (!amplifyStuff.Storage) {
      setUploadMessage("Amplify Storage is not loaded yet.");
      return;
    }
    setUploading(true);
    try {
      // Use the Storage object from our state.
      const result = await amplifyStuff.Storage.put(file.name, file, {
        level: "private",
        contentType: file.type,
      });
      setUploadMessage(`File uploaded successfully! Key: ${result.key}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  // If an error occurred while loading Amplify, display it.
  if (amplifyError) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Text>Error loading Amplify: {amplifyError}</Text>
      </Flex>
    );
  }

  // Until Amplify is loaded, show a loading message.
  if (!amplifyStuff.Amplify) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Text>Loading Amplify configuration...</Text>
      </Flex>
    );
  }

  return (
    // Wrap the content in the Authenticator so users must sign in.
    <Authenticator>
      {({ signOut, user }) => (
        <Flex direction="column" alignItems="center" justifyContent="center" height="100vh" gap="1rem">
          <Heading level={2}>Welcome, {user.username}</Heading>
          <Text>This is a test page with image upload functionality and login.</Text>
          {/* File input for selecting an image */}
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {/* Feedback: Show selected file name, if any */}
          {file && <Text>Selected file: {file.name}</Text>}
          {/* Upload button */}
          <Button onClick={uploadFile} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          {/* Display upload status message */}
          {uploadMessage && <Text>{uploadMessage}</Text>}
          {/* Sign Out button */}
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
