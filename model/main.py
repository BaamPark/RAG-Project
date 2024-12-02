import google.generativeai as genai
import os
from dotenv import load_dotenv
import pandas as pd
import time
import seaborn as sns

load_dotenv()
NOTE_MAX_LENGTH = 40000
COMMENT_MAX_LENGTH = 5000

def main():
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    base_model = "models/gemini-1.5-flash-001-tuning"
    training_data = prepare_data()

    operation = genai.create_tuned_model(
        # You can use a tuned model here too. Set `source_model="tunedModels/..."`
        id = "doctor001",
        display_name="attending_doctor",
        temperature=1.0,
        top_p=0.95,
        top_k=64,
        source_model=base_model,
        epoch_count=5,
        batch_size=4,
        learning_rate=0.001,
        training_data=training_data,
    )

    for status in operation.wait_bar():
        time.sleep(10)

    result = operation.result()
    print(result)
    snapshots = pd.DataFrame(result.tuning_task.snapshots)
    sns.lineplot(data=snapshots, x = 'epoch', y='mean_loss')

def prepare_data():
    df = pd.read_csv("model/training_data.csv")
    df['note'] = df['note'].apply(lambda x: x[:NOTE_MAX_LENGTH] if len(x) > NOTE_MAX_LENGTH else x)
    df['comments'] = df['comments'].apply(lambda x: x[:COMMENT_MAX_LENGTH] if len(x) > COMMENT_MAX_LENGTH else x)
    training_data = [{"text_input": row["note"], "output": row["comments"]} for _, row in df.iterrows()]
    # print(training_data[0]["output"])
    return training_data

if __name__ == "__main__":
    main()