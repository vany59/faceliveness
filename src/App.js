import "./App.css";
import { ThemeProvider, Loader } from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";

import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import awsexports from "./aws-exports";
import Rekognition from "aws-sdk/clients/rekognition";
import { Amplify } from "aws-amplify";
import { Auth } from "@aws-amplify/auth";
import { useState, useEffect } from "react";

Amplify.configure(awsexports);

function App() {
  const [loading, setLoading] = useState(true);
  const [createLivenessApiData, setCreateLivenessApiData] = useState(null);

  async function getRekognitionClient(credentials) {
    const rekognitionClient = new Rekognition({
      region: "ap-southeast-1",
      credentials,
      endpoint: "https://rekognition.ap-southeast-1.amazonaws.com",
    });

    return rekognitionClient;
  }

  useEffect(() => {
    console.log("vao day");
    if (createLivenessApiData) return;

    Auth.currentCredentials()
      .then(async (credentials) => {
        console.log("credentials", credentials);
        const rekognition = await getRekognitionClient(credentials);
        const response = await rekognition
          .createFaceLivenessSession()
          .promise();
        setCreateLivenessApiData(response.SessionId);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleAnalysisComplete = async () => {
    console.log("result");

    Auth.currentCredentials()
      .then(async (credentials) => {
        console.log("credentials", credentials);
        const rekognition = await getRekognitionClient(credentials);
        const response = await rekognition
          .getFaceLivenessSessionResults()
          .promise();
        console.log("response result", response);
      })
      .catch((e) => console.error(`result error`, e));
  };

  return (
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : (
        <>
          <span>{`sessionId: ${createLivenessApiData}`}</span>
          <FaceLivenessDetector
            sessionId={createLivenessApiData}
            region="ap-southeast-1"
            onAnalysisComplete={handleAnalysisComplete}
          />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
