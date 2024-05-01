import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import backgroundImage from "./assets/background.jpg";
import "./App.css";

function App() {
    const [image, setImage] = useState("");
    const [uploadResultMessage, setuploadeResultMessage] = useState(
        "Please upload an image to verify"
    );
    const [visitorName, setvisitorName] = useState("Sample_User_Icon.png");
    const [isAuth, setAuth] = useState("false");

    function sendImage(e) {
        e.preventDefault();
        setvisitorName(image.name);
        const visitorImageName = uuidv4();

        // call the API gateway to upload the images to S3
        fetch(
            `https://i02s3xa1wk.execute-api.us-west-2.amazonaws.com/dev/visitorsphotosbucket/${visitorImageName}.*`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "image/*",
                },
                body: image,
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    const verifyResponse = await verify(visitorImageName);
                    setAuth("true");
                    setuploadeResultMessage(
                        `Hey ${verifyResponse["firstName"]}. Welcome to Remmy's Home!`
                    );
                } else {
                    setAuth(false);
                    setuploadeResultMessage(
                        "Authentication failed, Remmy doesn't know you."
                    );
                }
            })
            .catch((error) => {
                setAuth(false);
                setuploadeResultMessage(
                    "There was an error verifying you. Are you sure you're at the right place 👀"
                );
                console.error(error);
            });
    }

    async function verify(visitorImageName) {
        const requestUrl =
            "https://i02s3xa1wk.execute-api.us-west-2.amazonaws.com/dev/my_friends?" +
            new URLSearchParams({
                objectKey: `${visitorImageName}.*`,
            });
        return await fetch(requestUrl, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                return data;
            })
            .catch((error) => console.error(error));
    }

    return (
        <div className="App">
            <div className="header">
                <h2>Karibu Nyumbani 🛖</h2>
            </div>
            <div className="content">
                <img
                    src={backgroundImage}
                    alt="Background"
                    className="background-image"
                />
                <form onSubmit={sendImage} className="form-container">
                    <input
                        type="file"
                        name="image"
                        onChange={(e) => setImage(e.target.files[0])}
                    ></input>
                    <button type="submit">Validate</button>
                </form>
                {/* Image upload success or fail message */}
                <div className= {isAuth ? "success" : "failure"}>
                    {uploadResultMessage}
                </div>
            </div>
            <img
                src={require(`./visitors/${visitorName}`)}
                alt="Visitor"
                height={300}
                width={250}
            />
        </div>
    );
}

export default App;
