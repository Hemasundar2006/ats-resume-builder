import spacy.cli

def main():
    print("Downloading the en_core_web_sm spaCy model...")
    spacy.cli.download("en_core_web_sm")
    print("Download complete!")

if __name__ == "__main__":
    main()
