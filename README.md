# Shopping Solvers – Online Purchase Abandonment Analytics

**IT 4793 – Applied Data-Driven Solutions | Kennesaw State University | Fall 2026**

Shopping Solvers is a data analytics project focused on understanding online shopper behavior and the factors connected to a completed or uncompleted purchase. The project takes public e-commerce session data, processes it into a format that can be used by a website, and presents the results through an interactive dashboard and session explorer.

The main goal is to move beyond simply showing how many shoppers completed a purchase. We want to explore what visitors were doing during a session, compare behavior between different visitor groups, and identify patterns that may help explain why a session ended with or without a purchase.

> **Important terminology:** The UCI dataset records whether a shopping session ended in a purchase. It does not directly record whether a customer placed an item in a cart and abandoned that cart. For that reason, this project uses terms such as *no-purchase session* or *session without a completed purchase* when describing the dataset outcome.

---

## 1. Project Overview

### Purpose

The purpose of Shopping Solvers is to use data-driven methods to examine online purchasing behavior. E-commerce businesses collect information about customer visits, page activity, and purchasing outcomes. When this information is organized and analyzed, it can help identify patterns in how customers interact with an online store.

Our project uses the UCI Online Shoppers Purchasing Intention Dataset as its primary data source. The dataset contains 12,330 shopping sessions and includes visitor information, page activity, session behavior, and a `Revenue` outcome.

### Project Objectives

- Collect and organize a public online shopping dataset.
- Clean and transform session records into a format that can be used by the website.
- Compare purchasing outcomes across visitor types and other session characteristics.
- Examine page activity and engagement patterns.
- Present findings through dashboard statistics, charts, and a searchable session table.
- Explore predictive classification to estimate whether a session will result in a purchase.
- Communicate findings and limitations in a way that is useful to both technical and non-technical audiences.

### Main Research Question

**What factors and patterns are associated with whether an online shopping session ends in a completed purchase?**

---

## 2. Project Repositories

The project is organized across two GitHub repositories. One contains the analytics data and supporting work, while the other contains the website and the code that displays the processed information.

| Repository | Purpose |
|---|---|
| [Shopping-Solvers-Analytics](https://github.com/IJackson12/Shopping-Solvers-Analytics) | Dataset and analytics-related project files |
| [online_purchase_abandonment](https://github.com/OnlyMario/online_purchase_abandonment) | Website, dashboard, data-processing script, and published project interface |

### Website

The website is published through GitHub Pages:

[Shopping Solvers – Purchase Intelligence](https://onlymario.github.io/online_purchase_abandonment/)

### How the Repositories Work Together

The analytics work starts with the original CSV dataset. The website repository contains a Python script that reads the dataset, extracts the fields currently used by the dashboard, calculates summary statistics, and writes the results to a JSON file. The website then loads that JSON file and uses JavaScript to display the dashboard and session records.

---

## 3. Dataset and Data Sources

### Primary Dataset: UCI Online Shoppers Purchasing Intention

The main dataset comes from the UCI Machine Learning Repository:

[Online Shoppers Purchasing Intention Dataset](https://archive.ics.uci.edu/dataset/468/online+shoppers+purchasing+intention+dataset)

The dataset contains **12,330 sessions**, with 18 attributes. Each record represents a shopping session. The `Revenue` field is the target outcome and indicates whether that session ended in a purchase.

### Dataset Summary

| Item | Description |
|---|---|
| Source | UCI Machine Learning Repository |
| Records | 12,330 sessions |
| Attributes | 18 |
| Target | `Revenue` |
| Positive outcome | Session ended in a purchase |
| Negative outcome | Session did not end in a purchase |
| Format | CSV |
| License | Creative Commons Attribution 4.0 International (CC BY 4.0) |

### Important Dataset Fields

The original dataset contains several types of information:

| Field | What It Represents |
|---|---|
| `Administrative` | Number of administrative pages visited |
| `Administrative_Duration` | Time spent on administrative pages |
| `Informational` | Number of informational pages visited |
| `Informational_Duration` | Time spent on informational pages |
| `ProductRelated` | Number of product-related pages visited |
| `ProductRelated_Duration` | Time spent on product-related pages |
| `BounceRates` | Bounce rate associated with the session |
| `ExitRates` | Exit rate associated with pages in the session |
| `PageValues` | Page value metric associated with the session |
| `SpecialDay` | Closeness of the visit date to a special day |
| `Month` | Month of the session |
| `OperatingSystems` | Operating system category |
| `Browser` | Browser category |
| `Region` | Geographic region category |
| `TrafficType` | Traffic source category |
| `VisitorType` | New, returning, or other visitor category |
| `Weekend` | Whether the session occurred on a weekend |
| `Revenue` | Whether the session ended in a purchase |

The original dataset has more information than the current website displays. The current dashboard-processing script uses a smaller selection of fields for its interactive features. The remaining fields can be used in additional analysis and predictive modeling.

### Additional Research Context

The project has also considered Google's public Google Analytics 4 ecommerce sample dataset in BigQuery as a possible additional source for exploring event-level ecommerce activity. This is a separate dataset from the UCI session dataset. It contains obfuscated sample events from the Google Merchandise Store from November 2020 through January 2021. It should not be combined with the UCI records as if they were the same customers or the same sessions.

Google's dataset is useful for understanding how event-level analytics can be queried and how a real ecommerce implementation may record user interactions. Any analysis using it should be reported separately and its obfuscation limitations should be considered.

---

## 4. Project Workflow and Data Pipeline

### Purpose

The data pipeline connects the original dataset to the website. Instead of manually entering dashboard totals, the Python script reads the CSV and calculates the values from the records.

### How It Works

1. **Collect:** Start with the original `online_shoppers_intention.csv` dataset.
2. **Process:** Run `build_analytics.py` to read each CSV row and select the fields needed by the website.
3. **Transform:** Convert values such as `Weekend` and `Revenue` into Boolean values and convert product page counts into numbers.
4. **Calculate:** Count total sessions, purchase sessions, and sessions without a purchase. Calculate the purchase and no-purchase percentages.
5. **Export:** Save the summary and individual session records into `data/analytics.json`.
6. **Present:** The website fetches the JSON file and uses JavaScript to update the dashboard, charts, filters, and session table.

### Data Flow

```text
UCI Online Shoppers Dataset
          |
          v
online_shoppers_intention.csv
          |
          v
     build_analytics.py
          |
          v
   Data Cleaning / Selection
          |
          v
  Summary Statistics + Sessions
          |
          v
     data/analytics.json
          |
          v
       script.js
          |
          v
Dashboard / Charts / Session Explorer
```

### Current Processing Script

The main processing script is `build_analytics.py`. It reads the CSV, converts selected values, calculates the summary statistics, and writes the output JSON file.

To run the script from the website repository:

```bash
python build_analytics.py
```

The script creates the `data` folder if it does not already exist and saves the generated file as:

```text
data/analytics.json
```

The generated JSON contains the following summary fields:

```json
{
  "totalSessions": 12330,
  "purchaseSessions": 1908,
  "sessionsWithoutPurchase": 10422,
  "purchaseRate": 15.47,
  "noPurchaseRate": 84.53,
  "sessions": []
}
```

The example above shows the summary values from the dataset. The actual generated file also contains the individual session records in the `sessions` array.

### Fields Currently Passed to the Website

The current processing script creates a simplified record for each session:

| JSON Field | Original CSV Field | Use |
|---|---|---|
| `session` | Generated row number | Identifies a record in the explorer |
| `visitor` | `VisitorType` | Visitor type filter and comparison |
| `weekend` | `Weekend` | Weekend / weekday filter |
| `month` | `Month` | Session month in the explorer |
| `productPages` | `ProductRelated` | Product page activity and averages |
| `purchased` | `Revenue` | Purchase outcome |

This is the current website data structure, not the full original dataset schema. Additional variables can be added to the JSON output as the analysis and dashboard expand.

---

## 5. Main Findings

### Purchase Outcome Distribution

The UCI dataset contains a noticeably larger number of sessions that did not end in a purchase than sessions that did.

| Outcome | Sessions | Percentage |
|---|---:|---:|
| Purchase completed (`Revenue = True`) | 1,908 | 15.47% |
| No purchase (`Revenue = False`) | 10,422 | 84.53% |
| **Total** | **12,330** | **100%** |

### What This Tells Us

- The majority of recorded sessions did not end in a purchase.
- Approximately 15.47% of sessions ended with a purchase.
- The dataset has an imbalanced target outcome because the no-purchase class is much larger than the purchase class.
- A model that simply predicts “no purchase” for every session could appear accurate because that is the majority class. Accuracy by itself would therefore not be enough to judge a predictive model.
- Additional comparisons are needed to understand which session characteristics are most strongly associated with purchasing.

### Important Interpretation

The 84.53% figure is the percentage of sessions without a completed purchase in this dataset. It should not be presented as the project's measured cart abandonment rate. A session may end without a purchase for many reasons, and the dataset does not directly confirm that the visitor added an item to a cart.

---

## 6. Website and Dashboard

### Purpose

The website makes the dataset easier to explore without requiring someone to open the CSV or run Python code. It provides a visual overview of the purchase outcomes and lets visitors filter and search through the session records.

### Main Website Sections

| Section | Purpose |
|---|---|
| Home | Introduces Shopping Solvers and the project goal |
| Dashboard | Displays summary statistics and visual comparisons |
| Data Explorer | Allows users to search and review session records |
| Research | Explains the research question, data collection, analysis, and presentation approach |
| Progress | Shows project milestones and development progress |
| Team | Introduces the project team and responsibilities |

### Dashboard Features

The current dashboard includes:

- Total shopping sessions.
- Purchase completion percentage.
- No-purchase percentage.
- Average product-related pages viewed.
- Purchase outcome distribution chart.
- Comparison of average product pages for purchase and no-purchase sessions.
- Visitor type filter.
- Weekend and weekday filter.
- Reset filters control.

The dashboard recalculates its displayed values based on the selected filters. This allows users to compare groups instead of relying only on the overall dataset totals.

### Session Explorer

The Session Explorer displays individual session records in a searchable table.

The current table includes:

- Session number
- Visitor type
- Day type
- Month
- Product pages viewed
- Purchase outcome

Users can search the records and export the matching, filtered results as a CSV file. The table displays up to 50 matching records at a time to keep the page manageable.

### Website Technology

| Technology | Purpose |
|---|---|
| HTML | Website structure and content |
| CSS | Layout, styling, and responsive presentation |
| JavaScript | Dashboard calculations, filters, search, table, and CSV export |
| Python | Reads and processes the original dataset |
| JSON | Transfers processed data to the website |
| GitHub Pages | Hosts the project website |

---

## 7. Predictive Classification and Decision Tree Analysis

### Purpose

Descriptive analytics helps explain what happened in the dataset. Predictive classification is the next step: using session characteristics to estimate whether a session is likely to end in a purchase.

The intended target variable is `Revenue`:

- `True` = purchase completed
- `False` = no purchase completed

### Planned Predictors

The original UCI dataset contains several useful variables for exploring purchase outcomes:

- Visitor type
- Administrative, informational, and product-related page activity
- Time spent on different page categories
- Bounce rate
- Exit rate
- Page values
- Month and weekend activity
- Traffic type and other session characteristics

The model should use the original session-level fields rather than only the reduced fields currently passed to the website.

### Why a Decision Tree?

A decision tree is useful for this project because it can show how different conditions split sessions into predicted outcomes. For example, the tree may identify combinations of page activity, visitor type, and page-value measurements that are associated with a higher or lower likelihood of a purchase.

The final tree should be interpreted using its actual learned splits. We should not assume in advance that a particular variable causes a purchase.

### Model Evaluation

Because the dataset has many more no-purchase sessions than purchase sessions, the model should be evaluated with more than accuracy.

Recommended evaluation measures include:

| Measure | Why It Matters |
|---|---|
| Accuracy | Overall percentage of correct predictions |
| Precision | How many sessions predicted as purchases actually purchased |
| Recall | How many actual purchase sessions the model correctly identifies |
| F1-score | Balances precision and recall |
| Confusion matrix | Shows correct and incorrect predictions for both classes |
| ROC-AUC | Measures how well the model separates the two outcomes across thresholds |

A stratified train/test split can help preserve the class distribution in both groups. Preprocessing and model training should be performed using the training data only, with the test set held back for final evaluation. Model results should be compared against a simple majority-class baseline.

### Current Status

**Predictive classification is a planned / developing part of the project.** The current website repository contains the data-processing script and descriptive dashboard, but it does not currently contain a committed decision-tree training script, saved model, or verified evaluation metrics. Model scores and feature importance should be added here after the model is trained and evaluated.

Once validated, model results can be presented in the website through a decision-tree visualization, feature-importance chart, confusion matrix, and a plain-language explanation of the patterns found.

---

## 8. Research Methodology: Collect, Analyze, Present

### 01 / COLLECT — Customer Data

The project uses the UCI Online Shoppers Purchasing Intention Dataset as its primary source. The data includes session-level visitor attributes, page activity, and a purchase outcome.

### 02 / ANALYZE — Behavior Patterns

The project processes the session records and compares purchase outcomes. Current analysis includes overall purchase rates, visitor type, day type, and product-related page activity. Future analysis can use the remaining UCI fields and predictive classification to examine additional patterns.

### 03 / PRESENT — Data Visualization

The website presents the findings through dashboard statistics, charts, filters, and a searchable session table. Additional model visualizations can be incorporated after predictive results are validated.

---

## 9. Project Structure

The following is a simplified view of the website repository's main files and folders.

```text
online_purchase_abandonment/
│
├── index.html
├── style.css
├── script.js
├── build_analytics.py
├── online_shoppers_intention.csv
│
└── data/
    └── analytics.json
```

| File / Folder | Purpose |
|---|---|
| `index.html` | Main website layout and sections |
| `style.css` | Website styling and responsive layout |
| `script.js` | Loads JSON data and manages dashboard behavior |
| `build_analytics.py` | Processes the CSV and generates analytics JSON |
| `online_shoppers_intention.csv` | Primary UCI dataset used by the website |
| `data/analytics.json` | Generated summary statistics and session records |

The analytics repository is maintained separately for supporting dataset and analysis work. Its contents may evolve as the project expands.

---

## 10. Running the Project Locally

### Requirements

- Python 3
- A modern web browser
- A local development server (recommended when loading JSON through `fetch()`)

### Step 1 — Download the Repository

Clone the website repository:

```bash
git clone https://github.com/OnlyMario/online_purchase_abandonment.git
cd online_purchase_abandonment
```

### Step 2 — Generate the Analytics File

Make sure `online_shoppers_intention.csv` is in the project folder, then run:

```bash
python build_analytics.py
```

This creates or updates:

```text
data/analytics.json
```

### Step 3 — Start a Local Web Server

From the project folder, run:

```bash
python -m http.server 8000
```

### Step 4 — Open the Website

Visit:

```text
http://localhost:8000
```

Using a local server is important because the website loads `data/analytics.json` with JavaScript `fetch()`. Opening the HTML file directly from the file system may prevent the browser from loading the JSON file correctly.

---

## 11. Limitations and Considerations

- **No direct cart event:** The UCI target identifies completed purchases, not confirmed cart additions and abandonments.
- **Historical dataset:** The UCI data is a public historical dataset and may not represent current shopping behavior or every online store.
- **Class imbalance:** Most sessions are in the no-purchase class, so model evaluation must consider precision, recall, F1-score, and the confusion matrix.
- **Reduced website fields:** The current JSON processing script passes only selected fields to the website. More variables are available in the original CSV for future analysis.
- **Separate data sources:** The UCI dataset and Google's BigQuery ecommerce sample are different datasets and should be analyzed separately unless a clear, defensible method is established.
- **No causal conclusion:** Relationships between session variables and purchase outcomes do not prove that one variable caused a purchase.
- **Predictive model status:** Model results should not be reported until the model has been trained, tested, and documented.

---

## 12. Future Development

The project can continue to improve through the following work:

- Expand the data-processing script to include additional UCI variables.
- Add more descriptive comparisons for visitor type, page activity, bounce rate, exit rate, and page values.
- Complete and evaluate a decision-tree classification model.
- Add model evaluation results and visualizations to the website.
- Explore Google's BigQuery ecommerce sample as a separate source of event-level examples.
- Improve the website's research and methodology explanations.
- Add documentation for refreshing the dataset and regenerating the JSON file.
- Continue testing the dashboard filters, data exports, and published website after updates.

---

## 13. Resources and References

The following sources support the dataset, project methodology, and technical tools referenced in this README.

Google. (n.d.). *BigQuery sample dataset for Google Analytics ecommerce web implementation*. Google for Developers. https://developers.google.com/analytics/bigquery/web-ecommerce-demo-dataset

Sakar, C., & Kastro, Y. (2018). *Online shoppers purchasing intention dataset* [Data set]. UCI Machine Learning Repository. https://doi.org/10.24432/C5F88Q

### Additional Project Links

- [UCI Dataset Page](https://archive.ics.uci.edu/dataset/468/online+shoppers+purchasing+intention+dataset)
- [Google Analytics BigQuery Ecommerce Sample](https://developers.google.com/analytics/bigquery/web-ecommerce-demo-dataset)
- [Shopping Solvers Website](https://onlymario.github.io/online_purchase_abandonment/)
- [Website GitHub Repository](https://github.com/OnlyMario/online_purchase_abandonment)
- [Analytics GitHub Repository](https://github.com/IJackson12/Shopping-Solvers-Analytics)

---

**Shopping Solvers | IT 4793 – Applied Data-Driven Solutions | Kennesaw State University**
