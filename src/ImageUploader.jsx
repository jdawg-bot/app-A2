import { useState } from "react";
import { Button, Text, Heading, Flex } from "@aws-amplify/ui-react";

export default function ImageUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadMessage("");
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setUploadMessage("Please select an image to upload.");
      return;
    }
    setUploading(true);
    try {
      // Dynamically import aws-amplify to avoid Vite issues
      const AmplifyModule = await import("aws-amplify");
      const { Storage } = AmplifyModule;
      const result = await Storage.put(file.name, file, {
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

  return (
    <Flex direction="column" alignItems="center" margin="2rem 0">
      <Heading level={3}>Upload an Image</Heading>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <Button onClick={uploadFile} disabled={uploading} marginTop="1rem">
        {uploading ? "Uploading..." : "Upload Image"}
      </Button>
      {uploadMessage && <Text marginTop="1rem">{uploadMessage}</Text>}
    </Flex>
  );
}
