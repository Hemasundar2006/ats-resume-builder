import spacy.cli

def main():
    print("Downloading the en_core_web_sm spaCy model...")
    try:
        spacy.cli.download("en_core_web_sm")
        print("Download complete!")
    except Exception as e:
        print(f"Error during download: {e}")

if __name__ == "__main__":
    main()
