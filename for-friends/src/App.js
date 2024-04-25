import { useState } from "react";
import "/assets/Sample_User_Icon";
import { v4 as uuidv4 } from "uuid";
import "./App.css";


function App() {
    const [image, setImage] = useState("");
    const [uploadResultMessage, setuploadeResultMessage] = useState(
        "Please upload an image to verify"
    );
    const [visitorName, setvisitorName] = useState("Sample_User_Icon.png");

    function sendImage(e) {
        e.preventDefault();
        setvisitorName(image.name);
        const visitorImageName = uuidv4();

        // call the API gateway to upload the images to S3
        fetch(
            `https://i02s3xa1wk.execute-api.us-west-2.amazonaws.com/dev/visitorsphotobucket/${visitorImageName}.png`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "/image/png",
                },
                body: image,
            }
        ).then(async () => {
            const response = await verify(visitorImageName);
            if (response.Message === "Success") {
                setuploadeResultMessage(
                    `Hey ${response["firstName"]}, brace yourself for the ultimate comfort zone! Shoes off, stretchy pants on, and get ready for some grade-A hospitality and maybe a dad joke or two.`
                );
            }
        });
    }

    return (
        <div className="App">
            <h2>Welcome to Remmy's Home 🛖</h2>
            <form onSubmit={sendImage}>
                <input
                    type="file"
                    name="image"
                    onChange={(e) => setTarget(e.target.files[0])}
                ></input>
                <button type="submit">Validate</button>
            </form>

            {/* Image upload success or fail message */}
            <div>{uploadResultMessage}</div>
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
