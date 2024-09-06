import React, { useState } from 'react';
import styled from 'styled-components';
import pako from 'pako';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const TextArea = styled.textarea`
  width: 80%;
  max-width: 600px;
  height: 150px;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  font-size: 14px;
`;

const Label = styled.label`
  font-size: 16px;
  margin-bottom: 10px;
`;

const Select = styled.select`
  padding: 5px;
  font-size: 14px;
  margin-left: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  &:hover {
    background-color: #0056b3;
  }
`;

const Result = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #333;
`;

function App() {
  const [jsonData, setJsonData] = useState(`{"unique_key" : "0119434834|000520", "product_id" : "498N5A", "region_id" : "US"}`);
  const [dataSize, setDataSize] = useState(50000);
  const [beforeSize, setBeforeSize] = useState(null);
  const [afterSize, setAfterSize] = useState(null);
  const [compressionTime, setCompressionTime] = useState(null);

  const handleJsonChange = (e) => {
    setJsonData(e.target.value);
  };

  const handleDataSizeChange = (e) => {
    setDataSize(Number(e.target.value));
  };


  const sendData = async () => {
    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (error) {
      console.error('Invalid JSON:', error);
      return;
    }
  
    // Generate rows based on the selected data size
    const rows = new Array(dataSize).fill(data);
  
    // Convert data to JSON string
    const dataToSend = JSON.stringify(rows);
  console.log(dataToSend);
    // Measure size before compression in bytes
    const beforeSizeBytes = new Blob([dataToSend]).size;
    const beforeSizeMB = (beforeSizeBytes / (1024 * 1024)).toFixed(2);
    setBeforeSize(beforeSizeMB);
  
    let compressedData;
    let timeTaken;
  
    // Record the time before compression
    const startTime = performance.now();
  
    compressedData = pako.deflate(dataToSend);
  
    // Record the time after compression
    const endTime = performance.now();
    timeTaken = ((endTime - startTime) / 1000).toFixed(2);
    setCompressionTime(timeTaken);
  
    // Measure size after compression in bytes
    const afterSizeBytes = compressedData.length
    const afterSizeMB = (afterSizeBytes / (1024 * 1024)).toFixed(2);
    setAfterSize(afterSizeMB);
  
    // Send data
    try {
      const response = await fetch('https://payload-compression-node.onrender.com/upload-compressed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'deflate',
          'X-Content-Compressed': 'true',
        },
        body: compressedData,
      });
  
      const responseData = await response.text();
      console.log(responseData);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <Container>
      <Title>Send Compressed Data</Title>
      <TextArea
        value={jsonData}
        onChange={handleJsonChange}
      />
      <br />
      <Label>
        Select Data Size:
        <Select value={dataSize} onChange={handleDataSizeChange}>
        {/* <option value={1}>1</option>
        <option value={100}>100</option>
        <option value={500}>500</option>
        <option value={1000}>1000</option> */}
          <option value={5000}>5000</option>
          <option value={20000}>20000</option>
          <option value={50000}>50000</option>
          <option value={100000}>100000</option>
          <option value={500000}>500000</option>
          <option value={1000000}>1000000</option>
        </Select>
      </Label>
      <br />
      <Button onClick={sendData}>Send Data</Button>
      {beforeSize !== null && afterSize !== null && compressionTime !== null && (
        <Result>
          <p>Payload Size Before Compression: {beforeSize} MB</p>
          <p>Payload Size After Compression: {afterSize} MB</p>
          <p>Time Taken to Compress Data: {compressionTime} seconds</p>
        </Result>
      )}
    </Container>
  );
}

export default App;
