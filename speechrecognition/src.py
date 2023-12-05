import speech_recognition as sr

# Initialize the recognizer
recognizer = sr.Recognizer()

# Create a microphone instance
microphone = sr.Microphone()

# Set the recognizer to use the Google Web Speech API for Japanese
with microphone as source:
    print("Listening for Japanese speech. Press Ctrl+C to stop.")
    recognizer.adjust_for_ambient_noise(source)  # Adjust for ambient noise
    
try:
    while True:  # Continuously listen for speech
        with microphone as source:
            audio = recognizer.listen(source)

        try:
            # Recognize the speech using Google Web Speech API
            recognized_text = recognizer.recognize_google(audio, language="ja-JP")

            if recognized_text:
                print(f"Recognized Text (Japanese): {recognized_text}")
            else:
                print("No speech detected or unable to recognize.")
        except sr.UnknownValueError:
            print("Could not understand the audio")
        except sr.RequestError as e:
            print(f"Could not request results; {e}")

except KeyboardInterrupt:
    print("Program stopped.")

