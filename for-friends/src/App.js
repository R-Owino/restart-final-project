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
            `https://i02s3xa1wk.execute-api.us-west-2.amazonaws.com/dev/visitorsphotosbucket/${visitorImageName}.jpg`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "/image/jpg",
                },
                body: image,
            }
        )
            .then(async (response) => {
                if (response.status === 200) {
                    const verifyResponse = await verify(visitorImageName);
                    setAuth("true");
                    setuploadeResultMessage(
                        `Hey ${verifyResponse["firstName"]}, brace yourself for the ultimate comfort zone! Shoes off, stretchy pants on, and get ready for some grade-A hospitality and maybe a dad joke or two.`
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
                    "Looks like there is an error verifying you. Are you sure you're at the right place 👀"
                );
                console.error(error);
            });
    }

    async function verify(visitorImageName) {
        const requestUrl =
            "https://i02s3xa1wk.execute-api.us-west-2.amazonaws.com/dev/my_friends?" +
            new URLSearchParams({
                objectKey: `${visitorImageName}.jpg`,
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
            <h2>Remmy's Home 🛖</h2>
            <div className="background-image-container">
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
            </div>
            {/* Image upload success or fail message */}
            <div className={isAuth ? "success" : "failure"}>
                {uploadResultMessage}
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
