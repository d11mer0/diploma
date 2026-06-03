---
tags:
- sentence-transformers
- sentence-similarity
- feature-extraction
- generated_from_trainer
- dataset_size:22
- loss:TripletLoss
base_model: sentence-transformers/all-MiniLM-L6-v2
widget:
- source_sentence: 'MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    LABORATORY WORK № 2

    “Practical Work: Customer Churn Prediction Using Machine Learning”

    on course “Machine learning methods”

    Kharkiv 2026


    -- 1 of 34 --


    2

    CONTENT

    1 Theoretic work material ...........................................................................3

    1.1 Theoretical background: customer churn prediction ..................3

    1.2 Implementation of customer churn prediction pipeline using machine

    learning ....................................................................................................5

    1.3 Some tips related to churn prediction pipeline ...............................19

    1.4 Formatting documents.....................................................................26

    1.4.1 Basic formatting standards for lab documents .........................26

    2 Tasks of laboratory work .......................................................................29

    2.1 The purpose of this practical work ..................................................29

    2.2 Stages of laboratory work ...............................................................29

    References .................................................................................................32

    Appendix A Sample of design of the title page ......................................33


    -- 2 of 34 --


    3

    1 THEORETIC WORK MATERIAL

    1.1 Theoretical background: customer churn prediction

    Customer churn is the rate at which customers stop using a company''s

    products or services over a specific time period. In competitive industries such
    as

    telecommunications, churn is a critical business metric because it directly impacts

    revenue, growth, and market share. High churn rates can signal dissatisfaction
    or

    stronger competition, making it essential for businesses to identify customers
    likely

    to leave and take action to retain them.

    Telecom companies, in particular, face challenges due to the individual

    variability in customer behavior and service usage patterns. As described in [1],

    churn is influenced by factors such as demographics, contract type, billing methods,

    and service preferences — but there is no obvious rule, which makes traditional
    rule-

    based prediction unreliable.

    Due to the complex and nonlinear nature of customer behavior, machine

    learning (ML) methods are better suited for churn prediction than traditional

    statistical models. ML can:

    − learn from large and high-dimensional data;

    − capture subtle and complex patterns in customer behavior;

    − generalize across different customer types and scenarios

    The paper by [1] explores a variety of ML algorithms for churn prediction,

    including:

    − Logistic Regression;

    − Decision Trees;

    − Random Forests;

    − K-Nearest Neighbors;

    − Gradient Boosting and XGBoost;

    − Naive Bayes;

    − Neural Networks.


    -- 3 of 34 --


    4

    Each algorithm has trade-offs in terms of accuracy, interpretability,

    computational cost, and sensitivity to data quality.

    In a churn prediction task, the workflow typically consists of:

    1) data acquisition;

    2) collect customer data such as demographics, billing history, subscription

    plans, and service usage;

    3) preprocessing (Focus of Laboratory Work 2)

    − handle missing values (e.g., imputing total charges);

    − encode categorical features (e.g., contract types, payment methods);

    − normalize or scale numerical variables (e.g., tenure, monthly charges);

    − split the dataset early into training and test sets to avoid data leakage.

    4) exploratory Data Analysis (focus of laboratory work 2);

    5) analyze feature distributions, churn correlation, and class imbalance; visual

    tools such as bar plots, boxplots, and heatmaps help uncover insights and guide

    modeling decisions.

    6) modeling (basic model training is demonstrated in this laboratory work;

    advanced model comparison is covered in laboratory work 3)

    7) apply and compare multiple ML models. Wu (2024) found that Gradient

    Boosting and XGBoost yielded the best results in their telecom churn dataset.

    8) evaluation and interpretation (basic evaluation using accuracy and

    confusion matrix is introduced in this laboratory work; deeper metric analysis
    is

    covered in laboratory work 3)

    9) use metrics like Accuracy, AUC, and KS Statistic to assess performance.

    Feature importance and confusion matrices help interpret the results.

    Summary of Findings from [1]:

    − best Performance: Gradient Boosting and XGBoost achieved the highest

    accuracy (≈75.5%) and AUC (≈0.84);

    − simplicity vs. Performance: Logistic Regression had lower performance but

    is fast and interpretable;


    -- 4 of 34 --


    5

    − feature Relevance: Subscription type, tenure, and payment method

    significantly influence churn;

    − data Quality Matters: Handling missing values and balancing class

    distribution (e.g., via oversampling) is crucial.

    There is once more real-world example (banking sector) - a study by [2]

    applied various ML models to predict credit card churn. Summary of Findings from

    [2]:

    − the Random Forest model achieved 97% accuracy in classifying churners;

    − churn prediction was enhanced by customer segmentation using k-means

    clustering;

    − Support Vector Machines and ensemble methods like AdaBoost were also

    effective in modeling churn behavior;

    − they emphasized the importance of balancing the dataset (e.g., using

    SMOTE) to improve prediction quality.

    1.2 Implementation of customer churn prediction pipeline using machine

    learning

    Dataset (data.csv) is provided for the prediction job.

    Part 1: Setting Up the Environment

    Step 1: Create a Virtual Environment

    It is recommended to use a virtual environment to manage dependencies.

    # Create a virtual environment

    python -m venv churn_env

    # Activate the environment (Windows)

    churn_env\Scripts\activate

    # Activate the environment (Mac/Linux)

    source churn_env/bin/activate


    -- 5 of 34 --


    6

    Step 2: Install Required Libraries

    Ensure that the required libraries are installed within the virtual environment.

    pip install pandas numpy scikit-learn matplotlib seaborn

    Step 3: Import Libraries

    import pandas as pd

    import numpy as np

    import matplotlib.pyplot as plt

    import seaborn as sns

    from sklearn.model_selection import train_test_split

    from sklearn.preprocessing import LabelEncoder, StandardScaler

    from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier,

    GradientBoostingClassifier

    from sklearn.svm import SVC

    from sklearn.neighbors import KNeighborsClassifier

    from sklearn.metrics import accuracy_score, confusion_matrix,

    classification_report

    Part 2: Data Acquisition and Test Set Creation

    Step 1: Load the Dataset

    Download the dataset from the provided GitHub repository () and load it into

    a Pandas DataFrame:

    # Load dataset

    df = pd.read_csv("data.csv")


    -- 6 of 34 --


    7

    # Display first few rows

    df.head()

    Step 2: Understand the Data

    Examine the dataset to understand its structure and contents:

    # Get summary of dataset

    df.info()

    # Check for missing values

    df.isnull().sum()

    # Display basic statistics

    df.describe()

    Step 3 Universal transformations like type conversion

    The TotalCharges column should not be categorical. It contains continuous

    numerical values.

    The issue likely occurred because:

    Some values were stored as strings in the dataset (e.g., ''85.05'' instead of

    85.05).

    Pandas interpreted TotalCharges as an object (dtype=object) instead of float.

    How to Fix It: Before creating test and train dataset, convert TotalCharges to

    a numerical format.

    Step 1: Convert TotalCharges to Numeric

    # Convert ''TotalCharges'' to numeric, replacing errors with NaN

    df[''TotalCharges''] = pd.to_numeric(df[''TotalCharges''], errors=''coerce'')


    -- 7 of 34 --


    8

    errors=''coerce'' replaces non-numeric values with NaN (to handle potential

    empty spaces or incorrect entries).

    Step 2: Handle Missing Values in TotalCharges

    After conversion, check for NaN values and fill them appropriately.

    # Fill missing values using median (avoids data leakage)

    df[''TotalCharges''].fillna(df[''TotalCharges''].median(), inplace=True)

    Why median? It works better for skewed distributions than mean.

    Step 4: Create a Test Set Before Any Data Exploration

    Before performing EDA, create a test set to prevent data snooping bias.

    # Step 1: Check original unique values (for debugging)

    print("Before Mapping:", df["Churn"].unique())

    # Step 2: Convert "Yes"/"No" to Numeric (0 and 1)

    df["Churn"] = df["Churn"].map({''Yes'': 1, ''No'': 0})

    # Step 3: Verify after mapping

    print("After Mapping:", df["Churn"].unique())

    # Step 4: Handle Missing Values

    df["Churn"] = df["Churn"].fillna(0) # Removed inplace=True

    # Step 5: Convert to Integer Type

    df["Churn"] = df["Churn"].astype(int)

    # Final Check

    print("Final Unique Values:", df["Churn"].unique()) # Should show [0 1]

    # Step 6: Define Features and Target Variable (Fix)

    X = df.drop("Churn", axis=1) # Features

    y = df["Churn"] # Target

    # Step 7: Split the Data Before Any EDA (Ensure Stratified Splitting)


    -- 8 of 34 --


    9

    X_train, X_test, y_train, y_test = train_test_split(

    X, y, test_size=0.3, random_state=42, stratify=y # Ensure balanced split

    )

    # Debugging Step: Verify Stratified Split

    print("y_train Distribution:\n", y_train.value_counts()) # Ensure both 0 and

    1 are present

    Part 3: Exploratory Data Analysis (EDA)

    EDA should now be performed only on the training set (X_train) to avoid bias.

    Step 1: Visualize Churn Distribution

    sns.countplot(x=y_train, hue=y_train, palette="viridis", legend=False)

    plt.title(''Churn Distribution'')

    plt.xlabel(''Churn'')

    plt.ylabel(''Count'')

    plt.xticks(ticks=[0,1], labels=["No Churn", "Churn"]) # Label classes

    plt.show()

    Step 2: Analyze Categorical Features

    Explore the relationship between categorical features and churn:

    1 Feature: "Contract" (e.g., Month-to-month, One-year, Two-year)

    Question: Does the contract type affect churn likelihood?

    sns.countplot(x=''Contract'', hue=y_train, data=X_train)

    plt.title(''Churn by Contract Type'')

    plt.show()

    2 Payment Method vs. Churn

    Feature: "PaymentMethod" (e.g., Electronic check, Credit card, Bank

    transfer). Question: Do certain payment methods correlate with higher churn rates?


    -- 9 of 34 --


    10

    sns.countplot(data=X_train, x=''PaymentMethod'', hue=y_train)

    plt.xticks(rotation=45)

    plt.title("Churn Rate by Payment Method")

    plt.show()

    3 Internet Service vs. Churn

    Feature: "InternetService" (e.g., DSL, Fiber optic, No internet service).

    Question: Does the type of internet service impact churn?

    sns.countplot(data=X_train, x=''InternetService'', hue=y_train)

    plt.title("Churn Rate by Internet Service Type")

    plt.show()

    4 Tenure Group vs. Churn

    Feature: "tenure" (converted into categories: Short-term, Medium-term,

    Long-term customers). Question: Does customer tenure impact churn?

    X_train[''TenureCategory''] = pd.cut(X_train[''tenure''], bins=[0, 12, 36, 72],

    labels=[''Short-term'', ''Medium-term'', ''Long-term''])

    sns.countplot(data=X_train, x=''TenureCategory'', hue=y_train)

    plt.title("Churn Rate by Customer Tenure")

    plt.show()

    The TenureCategory feature is created only for exploratory analysis to

    simplify visualization and interpretation of customer tenure groups. This feature
    is

    removed later before model training because the numerical variable tenure already

    captures the necessary information.


    -- 10 of 34 --


    11

    5 Multiple Services vs. Churn

    Feature: "MultipleLines" (e.g., Yes, No, No phone service). Question: Do

    customers with multiple services (e.g., phone & internet) churn less?

    sns.countplot(data=X_train, x=''MultipleLines'', hue=y_train)

    plt.title("Churn Rate by Multiple Services")

    plt.show()

    Summary of insights of exploring the relationship between categorical

    features and churn are provided in table 1.1

    Table 1.1 – Categorical features and expected impact on churn

    Categorical Feature Expected Impact on Churn

    Contract Type Month-to-month customers likely churn more.

    Payment Method Electronic check users may churn more.

    Internet Service Fiber optic users may have higher churn due to cost.

    Customer Tenure Short-term customers are more likely to churn.

    Multiple Services Customers with bundled services may have lower

    churn.

    Step 3: Analyze Numerical Features

    Examine numerical features for patterns:

    sns.boxplot(x=y_train, y=''MonthlyCharges'', data=X_train)

    plt.title(''Monthly Charges by Churn Status'')

    plt.show()

    Step 4: Correlation Heatmap for Proper Features

    To identify important numerical features, use a correlation heatmap.

    # Select only numerical features


    -- 11 of 34 --


    12

    numerical_features = X_train.select_dtypes(include=[''int64'',

    ''float64'']).columns

    # Compute correlation matrix

    corr_matrix = X_train[numerical_features].corr()

    # Plot heatmap

    plt.figure(figsize=(12, 8))

    sns.heatmap(corr_matrix, annot=True, cmap=''coolwarm'', fmt=".2f")

    plt.title("Feature Correlation Heatmap")

    plt.show()

    Part 4: Data Preprocessing

    Step 1: Handle Missing Values

    # Check missing values

    print(X_train.isnull().sum())

    X_train.drop(columns=[''TenureCategory''], inplace=True, errors=''ignore'')

    X_test.drop(columns=[''TenureCategory''], inplace=True, errors=''ignore'')

    # Fill missing values with forward fill (ffill)

    X_train = X_train.ffill()

    X_test = X_test.ffill()

    Step 2: Encode Categorical Variables

    Before encoding, check for unseen labels in X_test.

    for column in X_train.select_dtypes(include=[''object'']).columns:

    train_categories = set(X_train[column].unique())


    -- 12 of 34 --


    13

    test_categories = set(X_test[column].unique())

    unseen_categories = test_categories - train_categories # Categories in test

    but NOT in train

    print(f"Feature: {column}")

    print(f"Unseen Categories in Test Set: {unseen_categories}\n")

    Next several steps are optional:

    1 Drop customerID Before Processing

    Since customerID is a unique identifier and not useful for predictions, remove

    it from X_train and X_test:

    X_train = X_train.drop(columns=[''customerID''], errors=''ignore'')

    X_test = X_test.drop(columns=[''customerID''], errors=''ignore'')

    2 If there are few unseen labels, apply Label Encoding:

    label_encoder = LabelEncoder()

    for column in X_train.select_dtypes(include=[''object'']).columns:

    X_train[column] = label_encoder.fit_transform(X_train[column]) # Fit

    on train

    X_test[column] = X_test[column].map(lambda s:

    label_encoder.transform([s])[0] if s in label_encoder.classes_ else -1) # Handle

    unseen

    If many unseen labels exist, use One-Hot Encoding instead:

    X_train = pd.get_dummies(X_train)

    X_test = pd.get_dummies(X_test)


    -- 13 of 34 --


    14

    # Align train & test sets (ensure same columns)

    X_train, X_test = X_train.align(X_test, join=''left'', axis=1, fill_value=0)

    Step 3: Scale Numerical Features

    scaler = StandardScaler()

    numerical_features = [''tenure'', ''MonthlyCharges'', ''TotalCharges'']

    X_train[numerical_features] =

    scaler.fit_transform(X_train[numerical_features])

    X_test[numerical_features] = scaler.transform(X_test[numerical_features])

    # Apply same scaling

    Part 5: Model Building and Evaluation

    # Ensure y_train is integer

    y_train = y_train.astype(int)

    y_test = y_test.astype(int)

    The following steps are optional and added to the guide due to some issues

    that arose during the development of the model:

    Dropping TenureCategory should not cause the model to fail unless there are

    other underlying issues. It is necessary to check potential reasons:

    1 Ensure All Features Are Numeric

    Before training, check if X_train has only numerical features:

    print(X_train.dtypes)

    If there are any object (categorical) types remaining, they need to be encoded.


    -- 14 of 34 --


    15

    Apply Label Encoding if needed:

    from sklearn.preprocessing import LabelEncoder

    label_encoder = LabelEncoder()

    for column in X_train.select_dtypes(include=[''object'']).columns:

    X_train[column] = label_encoder.fit_transform(X_train[column])

    X_test[column] = label_encoder.transform(X_test[column])

    3 Check for Missing Values

    Before training, verify that X_train has no missing values:

    print(X_train.isnull().sum().sum()) # Sum of all NaNs

    If missing values exist, the model cannot handle them.

    Fill missing values with median or mode:

    X_train = X_train.fillna(X_train.median())

    X_test = X_test.fillna(X_test.median())

    Ensure y_train is in the Correct Format

    If not, then convert it to an integer type:

    y_train = y_train.astype(int)

    y_test = y_test.astype(int)

    If y_train is in one-hot encoded format, convert it to a 1D array:

    y_train = y_train.ravel()

    y_test = y_test.ravel()


    -- 15 of 34 --


    16

    4 Verify That X_train and X_test Have the Same Features

    If TenureCategory was removed from X_train but not from X_test, their

    shapes will be different, and training will fail.

    Ensure both datasets match:

    print(X_train.shape, X_test.shape)

    If they are different, align them:

    X_train, X_test = X_train.align(X_test, join=''left'', axis=1, fill_value=0)

    Since the dataset shape is correct, but the model is still failing, it is necessary

    to check for other possible issues:

    1 Ensure y_train is in the Correct Format

    Print the unique values and data type of y_train:

    print("y_train unique values:", y_train.unique())

    print("y_train dtype:", y_train.dtype)

    If y_train is not an integer type, convert it:

    y_train = y_train.astype(int).ravel()

    y_test = y_test.astype(int).ravel()

    2 Ensure X_train Contains Only Numeric Features

    Check if any categorical (object) features remain:

    print(X_train.dtypes)


    -- 16 of 34 --


    17

    If you find object types, encode them using Label Encoding:

    from sklearn.preprocessing import LabelEncoder

    label_encoder = LabelEncoder()

    for column in X_train.select_dtypes(include=[''object'']).columns:

    X_train[column] = label_encoder.fit_transform(X_train[column])

    X_test[column] = label_encoder.transform(X_test[column])

    3 Check for Missing Values

    Make sure there are no missing values left in X_train:

    print(X_train.isnull().sum().sum()) # Should be 0

    If Needed: Fill missing values:

    X_train = X_train.fillna(X_train.median())

    X_test = X_test.fillna(X_test.median())

    After applying these fixes, run this to confirm everything is correct:

    print("Final X_train shape:", X_train.shape)

    print("Final X_test shape:", X_test.shape)

    print("Missing values in X_train:", X_train.isnull().sum().sum())

    print("Missing values in X_test:", X_test.isnull().sum().sum())

    print("y_train unique values:", y_train.unique())

    print("y_train dtype:", y_train.dtype)

    Final Model Training & Evaluation

    Random Forest should be considered the baseline model in this laboratory

    work. Other models are included for optional comparison.


    -- 17 of 34 --


    18

    # Initialize models

    models = {

    ''Random Forest'': RandomForestClassifier(n_estimators=100,

    random_state=42),

    ''AdaBoost'': AdaBoostClassifier(n_estimators=100, random_state=42),

    ''Gradient Boosting'': GradientBoostingClassifier(n_estimators=100,

    random_state=42),

    ''Support Vector Machine'': SVC(kernel=''linear'', probability=True,

    random_state=42)

    }

    In this laboratory work, the primary evaluation metrics are accuracy and the

    confusion matrix, which provide a basic understanding of model performance.

    Additional metrics such as precision, recall, F1-score, AUC, and KS statistic
    are

    included for demonstration purposes. A deeper analysis of model evaluation metrics

    will be performed in Laboratory Work 3.

    # Train and evaluate models

    for name, model in models.items():

    model.fit(X_train, y_train) # Ensure y_train is integer

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    print(f''{name} Accuracy: {accuracy:.2f}'')

    print(confusion_matrix(y_test, y_pred))

    print(classification_report(y_test, y_pred))

    from sklearn.metrics import roc_auc_score

    from scipy import stats


    -- 18 of 34 --


    19

    import numpy as np

    # Assuming your model supports predict_proba

    y_proba = model.predict_proba(X_test)[:, 1]

    # AUC Score

    auc = roc_auc_score(y_test, y_proba)

    print(f"AUC Score: {auc:.4f}")

    # KS Statistic

    ks_stat, _ = stats.ks_2samp(y_proba[y_test == 1], y_proba[y_test == 0])

    print(f"KS Statistic: {ks_stat:.4f}")

    1.3 Some tips related to churn prediction pipeline

    The following methodological tips help avoid common mistakes when

    implementing a machine learning pipeline.

    1 One of the most critical yet often overlooked steps in a machine learning

    project is creating a test set before performing exploratory data analysis (EDA)
    or

    training models. While it may seem counterintuitive to set aside a portion of
    the

    dataset before analyzing it fully, doing so prevents data snooping bias and ensures
    a

    more accurate evaluation of model performance.

    Our brains are excellent at recognizing patterns, which can lead to

    unintentional overfitting. If we explore the dataset too much before setting aside
    a

    test set, we might subconsciously choose models or preprocessing techniques that

    perform well on the test data, leading to an overoptimistic generalization error

    estimate. As a result, when deployed in real-world scenarios, the model might
    fail to

    perform as expected.

    To prevent this, we create a test set at the start of the project and use it only

    after the model is trained.


    -- 19 of 34 --


    20

    Table 1.2

    Approach Advantages Disadvantages

    Random Sampling Simple to implement Test set changes on

    every run

    Fixed Random Seed Ensures consistent splits Still purely random

    ID-Based Sampling Stable even if dataset updates Requires a unique

    identifier

    Stratified Sampling Preserves important attribute

    distributions

    Adds preprocessing

    complexity

    There is summary:

    − use stratified sampling when dataset attributes are highly correlated with the

    target variable;

    − use ID-based splits if a stable unique identifier is available;

    − if dataset size is large enough, random sampling with a fixed seed is often

    sufficient.

    By setting aside a properly structured test set, we ensure the model is

    evaluated fairly without data snooping bias, leading to more reliable generalization

    performance.

    2 There are several methods for handling missing data depending on the nature

    of the dataset and the extent of missing values. Here’s a breakdown of possible

    approaches:

    1 Drop Missing Values (If the Amount is Small)

    If the number of missing values is very low compared to the dataset size,

    removing rows with missing values is a simple solution.

    # Drop rows with missing values

    X_train.dropna(inplace=True)

    X_test.dropna(inplace=True)

    Pay attention on these issues:


    -- 20 of 34 --


    21

    − it can be performed: Missing data is minimal (<5% of total data).

    − it should not perform: Dropping rows significantly reduces the dataset.

    2 Forward Fill (ffill)

    Fills missing values using the previous row''s data.

    X_train.fillna(method=''ffill'', inplace=True)

    X_test.fillna(method=''ffill'', inplace=True)

    Pay attention on these issues:

    − it can be performed: time-series or sequential data where previous values

    make sense for replacement.

    − it should not perform: Non-sequential categorical/numerical data.

    3 Backward Fill (bfill)

    Fills missing values using the next row''s data.

    X_train.fillna(method=''bfill'', inplace=True)

    X_test.fillna(method=''bfill'', inplace=True)

    Pay attention on these issues:

    − it can be performed: time-series datasets where future values can inform

    past data.

    − it should not perform: non-time-series data.

    4 Mean/Median/Mode Imputation

    Filling numerical features with the mean, median, or categorical features with

    the mode (most frequent value).

    # Fill numerical features with mean

    X_train.fillna(X_train.mean(), inplace=True)

    X_test.fillna(X_train.mean(), inplace=True) # Use training data stats


    -- 21 of 34 --


    22

    # Fill categorical features with mode

    for col in X_train.select_dtypes(include=[''object'']).columns:

    X_train[col].fillna(X_train[col].mode()[0], inplace=True)

    X_test[col].fillna(X_train[col].mode()[0], inplace=True) # Use training

    data stats

    Pay attention on these issues:

    − it can be performed: small missing data percentages in

    numerical/categorical columns.

    − it should not perform: skewed distributions (use median instead of mean for

    skewed data).

    5 Predictive Imputation (Using Machine Learning)

    A more advanced technique where missing values are predicted based on

    other available features.

    from sklearn.impute import KNNImputer

    imputer = KNNImputer(n_neighbors=5)

    X_train_imputed = imputer.fit_transform(X_train)

    X_test_imputed = imputer.transform(X_test)

    Pay attention on these issues:

    − it can be performed: large datasets with complex patterns in missing data.

    − it should not perform: not ideal for: Small datasets where KNN might

    overfit.

    6 Indicator Variable for Missing Data

    Instead of filling missing values, we create an indicator column to flag them.

    for col in X_train.columns:


    -- 22 of 34 --


    23

    X_train[col + ''_missing''] = X_train[col].isnull().astype(int)

    X_test[col + ''_missing''] = X_test[col].isnull().astype(int)

    X_train.fillna(-999, inplace=True) # Replace missing values with an outlier

    value

    X_test.fillna(-999, inplace=True)

    Pay attention on these issues:

    − it can be performed: best for: Cases where missing values might contain

    hidden patterns (e.g., missing salary info could indicate unemployment).

    − it should not perform: not ideal for: When missing data is completely

    random.

    The list of situations and proper methods are showed in the table 1.3

    Table 1.3 - Choosing the Best Method

    Situation Recommended Method

    Few missing values (<5%) Drop rows (dropna())

    Time-series data Forward fill (ffill) or Backward fill (bfill)

    Numerical features Mean (mean()), Median (median()), or KNN

    Imputation

    Categorical features Mode (mode())

    Large missing values (>30%) Predictive modeling (e.g., KNN Imputation)

    Missing values may hold

    information Indicator variable

    3 Machine learning models, especially those from scikit-learn, typically work

    with numerical data only. Since categorical variables contain text labels, we
    must

    convert them into numerical values before training the model.

    In Step 2: Encode Categorical Variables, we used Label Encoding:

    label_encoder = LabelEncoder()

    for column in X_train.select_dtypes(include=[''object'']).columns:


    -- 23 of 34 --


    24

    X_train[column] = label_encoder.fit_transform(X_train[column]) # Fit

    and transform on training set

    X_test[column] = label_encoder.transform(X_test[column]) # Only

    transform test set

    This step is necessary because:

    − converts text into numbers – Machine learning models cannot process text

    directly.

    − ensures consistency – The encoding ensures categorical data is consistently

    represented across train and test sets.

    − prevents data leakage – We only fit on X_train and apply the same

    transformation to X_test to avoid information leakage.

    Other Encoding Methods

    1 One-Hot Encoding (Creates separate columns for each category, with 0/1

    values)

    X_train = pd.get_dummies(X_train, columns=[''Contract'',

    ''PaymentMethod''])

    X_test = pd.get_dummies(X_test, columns=[''Contract'', ''PaymentMethod''])

    Pay attention on these issues:

    − it can be performed: best when there are few unique values;

    − it should not perform: not ideal for high-cardinality features (many unique

    categories).

    2 Ordinal Encoding (Ranks categories based on an order)

    from sklearn.preprocessing import OrdinalEncoder

    encoder = OrdinalEncoder()

    X_train[[''Contract'']] = encoder.fit_transform(X_train[[''Contract'']])


    -- 24 of 34 --


    25

    X_test[[''Contract'']] = encoder.transform(X_test[[''Contract'']])

    Pay attention on these issues:

    − it can be performed: best when categories have a natural order (e.g., Low,

    Medium, High).

    − it should not perform: not suitable for unordered categories (e.g., payment

    methods).

    To determine whether you have few unseen labels in the test set (compared to

    the training set), follow these steps:

    Step 1: Compare Unique Categories in Train vs. Test

    Run the following code to check if there are many or few unseen categories:

    for column in X_train.select_dtypes(include=[''object'']).columns:

    train_categories = set(X_train[column].unique()) # Unique categories in

    train

    test_categories = set(X_test[column].unique()) # Unique categories in test

    unseen_categories = test_categories - train_categories # Categories in test

    but NOT in train

    print(f"Feature: {column}")

    print(f"Unseen Categories in Test Set: {unseen_categories}\n")

    Step 2: Interpret the Output

    1 Few unseen labels

    1) feature: PaymentMethod;

    2) unseen Categories in Test Set: {''Bitcoin''};

    3) decision: Use Label Encoding with handling for unknown labels (Solution

    1).

    2 Many unseen labels


    -- 25 of 34 --


    26

    1) feature: City

    2) unseen Categories in Test Set: {''New York'', ''Los Angeles'', ''Houston'',

    ''Miami'', ''Seattle''}

    3) decision: Use One-Hot Encoding (Solution 2) or Ordinal Encoding

    (Solution 3), depending on whether the variable has order.

    Step 3: Apply the Best Encoding Strategy

    If there are a few unseen labels, use LabelEncoder with unknown label

    handling:

    X_test[column] = X_test[column].map(lambda s: le.transform([s])[0] if s in

    le.classes_ else -1)

    If there are many unseen labels, use One-Hot Encoding:

    X_train = pd.get_dummies(X_train)

    X_test = pd.get_dummies(X_test)

    X_train, X_test = X_train.align(X_test, join=''left'', axis=1, fill_value=0)

    Table 1.4

    Unseen Labels in Test Set Encoding Method

    0 (No unseen labels) Normal LabelEncoder

    1-3 (Few unseen labels) LabelEncoder with -1 for unknown labels

    4+ (Many unseen labels) One-Hot Encoding (pd.get_dummies())

    1.4 Formatting documents

    1.4.1 Basic formatting standards for lab documents

    The report is prepared in the text editor MS Word [3]. You need to open the

    template at the link [4] and save the document in .docx format with the appropriate

    name, for example, Report_1_BCSMAI_Ivanov_KN_424.docx. This template is a


    -- 26 of 34 --


    27

    set of styles that should be used when creating reports on laboratory work, this

    template also explains the cases of using one or another style, formatting and
    design

    of various elements of the report. Before making a report, you should study the

    requirements for making reports, which are given in the template and below the
    text.

    It is considered that the student has basic skills in MS Word (or similar editors,

    such as OpenOffice.org Writer).

    Document formatting refers to the way a document is laid out on the page—

    the way it looks and is visually organized—and it addresses things like font

    selection, font size and presentation (like bold or italics), spacing, margins,

    alignment, columns, indentation, and lists. Basically, the mechanics of how the

    words appear on the page. A well formatting document is consistent, correct (in

    terms of meeting any stated requirements), and easy to read [5].

    Basic formatting standards include:

    1 The report is made on sheets of A4 printing paper (297 mm x 210 mm). The

    margins must be: left, bottom and top - not less than 20 mm, right - not less
    than 10

    mm.

    2 14 pt. font in a consistent style throughout, including section headings and

    subsection headings, headers, footers, and visual labels. Font of notes, text
    elements

    in table can be 12 pt.

    3 A standard, professional font is Times New Roman.

    4 1.5 line spacing, with 1.25 indentation on the first line of the paragraph

    5 Body text text is aligned with both margins

    6 Page numbers at upper right corner (Arabic numerals). The number is not

    placed on the title page, which is the first page of the document, but it is included
    in

    the general numbering (a sample of the title page for the report on laboratory
    work

    is given in Appendix A).

    Documents usually have some form of “logical structure”: division into

    chapters, sections, sub-sections etc. to organize its content. Each element of
    structure

    has corresponding heading, and heading of each part of document has own formtting

    standards:


    -- 27 of 34 --


    28

    7 Heading of Section. New section begins with a new page (page break at the

    end of the previous part of the text). Formatting of heading of section: Times
    New

    Roman 14 pt., bold, Capital, center text, 1.5 line spacing, after heading 21 points.

    8 Heading of Subsection is separated from the text body by blank line.

    Formatting of heading of subsection: Times New Roman 14 pt., bold, justified text,

    1.25 indentation.

    9 Heading of Item is NOT separated by line from the text body. Formatting

    of heading of item:Times New Roman 14 pt., bold, justified text, 1.25 indentation.

    To automatically generate table of contents, you must first configure the styles

    of elements of structure.


    -- 28 of 34 --


    29

    2 TASKS OF LABORATORY WORK

    2.1 The purpose of this practical work

    This laboratory work introduces students to the foundations of a real-world

    machine learning workflow through the practical task of customer churn prediction.

    By focusing on data preprocessing and exploratory data analysis (EDA),

    students will:

    − learn how to prepare raw data for machine learning models through

    handling missing values, encoding categorical variables, and scaling numerical

    features;

    − develop skills to identify patterns and correlations in customer behavior that

    may influence churn;

    − practice splitting data correctly (train/test sets) to avoid data leakage and

    ensure valid model evaluation;

    − visualize distributions and relationships to gain a better understanding of

    dataset characteristics.

    This laboratory work focuses on preparing data for predictive modeling. In

    Laboratory Work 3, students will build on this foundation by performing in-depth

    model comparison, hyperparameter tuning, and feature engineering using their own

    selected dataset.

    2.2 Stages of laboratory work

    The main stages of this practical work are the following:

    1 Perform next steps:

    Step 1: Replication of Instructor’s Code

    Students must:

    1) run the provided customer churn prediction pipeline;

    2) carefully follow and document each stage:

    − environment setup;

    − data preprocessing;


    -- 29 of 34 --


    30

    − EDA (charts + insights);

    − model training and evaluation;

    − final conclusions.

    Results: well-commented Jupyter Notebook; screenshots or embedded graphs

    with explanations

    Step 2: Extended EDA

    Students must:

    1) perform comprehensive EDA on training data:

    − summarize class imbalance;

    − visualize relationships between features and churn;

    − use grouping, pivot tables, and heatmaps.

    2) interpret patterns: Why do customers churn? What features are most

    informative?

    Tips: use of groupby(), value_counts(), visualizations with

    Seaborn/Matplotlib

    Step 3: Modeling and Evaluation

    Students must train at least one classification model (Random Forest).

    Additional models (e.g., AdaBoost, SVM) may be trained for comparison. Students

    must interpret the obtained results and explain the meaning of evaluation metrics

    such as accuracy and confusion matrix.

    2 After completing this laboratory work, students should prepare a report

    that includes the following sections:

    1) Objective – A brief description of the purpose of this work.

    2) Main Steps – A summary of the key steps performed.

    3) Results – Key findings from the data analysis.

    4) Screenshots – If necessary, students should provide screenshots of

    key outputs.

    5) Knowledge and Skills Acquired – A reflection on what was learned

    and how these skills can be applied to real-world data analysis tasks.


    -- 30 of 34 --


    31

    This structured report will ensure a comprehensive understanding of the

    practical work and enhance documentation skills.

    3 Defend laboratory work individually: present results; answer questions

    related to the topic or the laboratory work.


    -- 31 of 34 --


    32

    REFERENCES

    1 Wu, S. (2024). Customer churn prediction in telecom based on machine

    learning. Proceedings of the 2024 International Conference on Computer

    Engineering and Artificial Intelligence (ICCEAI), 5(1), 100–107.

    2 Tran, H., Le, N., & Nguyen, V.-H. (2023). Customer churn prediction

    in the banking sector using machine learning-based classification models.

    Interdisciplinary Journal of Information, Knowledge, and Management, 18, 87-105.

    https://doi.org/10.28945/5086

    3 Microsoft Support // https://support.microsoft.com/en-us/word?ui=en-

    us&rs=en-us&ad=us, 01.03.2025

    4 Templates for reports on laboratory work //

    https://iiiii.sharepoint.com/:f:/s/Profs.PIITU/ErRwourAhj1AjM3szMwHEsgBcqyrl

    0_Ik8_xHIJp2A-lLQ?e=8nfxUH, 01.03.2025

    5 Chapter 8. Formatting Documents //

    https://ohiostate.pressbooks.pub/feptechcomm/chapter/8-formatting/, 01.03.2025


    -- 32 of 34 --


    33

    APPENDIX A

    Sample of design of the title page

    MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    Institute (faculty) of Computer Sciences and Software Engineering

    Department of Software Engineering and Management Information Technology

    Program Subject Area 121 Software engineering

    Educational Software engineering __________

    Specialization _________________________________________________

    LABORATORY WORK №2 on course

    «Machine learning methods»

    Laboratory work subject Practical Work: Customer Churn Prediction Using

    Machine Learning

    Executed by student 1 year, group KN-N225

    Pavel ZHERZHERUNOV

    (signature, surname and name)

    Checked by Oksana IVASHCHENKO

    (signature, surname and name)

    Kharkiv 2026


    -- 33 of 34 --


    34

    MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    Institute (faculty) of Computer Sciences and Software Engineering

    Department of Software Engineering and Management Information Technology

    Program Subject Area 122 Computer science

    Educational Computer science and intelligent systems __________

    Specialization _________________________________________________

    LABORATORY WORK №2 on course

    «Machine learning methods»

    Laboratory work subject Practical Work: Customer Churn Prediction Using

    Machine Learning

    Executed by student 1 year, group KN-M425

    Pavel ZHERZHERUNOV

    (signature, surname and name)

    Checked by Oksana IVASHCHENKO

    (signature, surname and name)

    Kharkiv 2026


    -- 34 of 34 --


    '
  sentences:
  - Sales Development. Establishes a systematic process for the sales and marketing
    of the organisation’s products and services, including value-added resellers (VARs)
    if appropriate; including understanding of customer needs, sales forecasting,
    prospect evaluation and negotiation tactics. Develops technical proposals to meet
    customer solution requirements and offer competitive bids aligned with the organisation’s
    capacity to deliver.
  - Testing. Constructs and executes systematic test procedures for ICT systems or
    customer usability requirements to establish compliance with design specifications.
    Ensures that new or revised components or systems perform to expectation. Ensures
    meeting of internal, external, national and international standards; including
    health and safety, usability, performance, reliability or compatibility. Produces
    documents and reports to evidence certification requirements.
  - Digital Marketing. Understands the fundamental principles of digital marketing.
    Distinguishes between the traditional and digital approaches. Appreciates the
    range of channels available. Assesses the effectiveness of the various approaches
    and applies rigorous measurement techniques. Plans a coherent strategy using the
    most effective means available. Understands the data protection and privacy issues
    involved in the implementation of the marketing strategy.
- source_sentence: '"Студент повинен вміти проектув ати архітектуру серверної частини
    веб-додатку. Необхідно мати глибокі знання з мов прогр амування Python та Java.
    Також студент має створювати оптимізовані запити до реляційних баз даних за допомо
    гою SQL і налаштовувати контейнеризацію через Docker."'
  sentences:
  - Application Development. Interprets the application design to develop a suitable
    application in accordance with customer needs. Adapts existing solutions by e.g.
    porting an application to another operating system. Codes, debugs, tests and documents
    and communicates product development stages. Selects appropriate technical options
    for development such as reusing, improving or reconfiguration of existing components.
    Optimises efficiency, cost and quality. Validates results with user representatives,
    integrates and commissions the overall solution.
  - Service Delivery. Ensures service delivery in accordance with established service
    level agreements (SLA's). Takes proactive action to ensure stable and secure applications
    and ICT infrastructure to avoid potential service disruptions, attending to capacity
    planning and to information security. Updates operational document library and
    logs all service incidents. Maintains monitoring and management tools (i.e. scripts,
    procedures). Maintains IS services. Manages all aspects of service availability.
  - Documentation Production. Produces documents by integrating information and maintaining
    compliance with relevant requirements. Selects the appropriate style and format
    by determining the media type and presentation mode of the documentation. Creates
    templates for document-management systems. Ensures that documentation complies
    with customers’, technical and ICT application development process needs and that
    existing documents are valid and up to date. Provides support for the development
    of interactive documents.
- source_sentence: 'MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    LABORATORY WORK №4

    “Applied Machine Learning Workflow: Case Study and Practical

    Implementation”

    on course «Machine learning methods»

    Kharkiv 2026


    -- 1 of 19 --


    2

    CONTENT

    1 Theoretic work material ...............................................................................
    3

    1.1 Theoretical background: flight delay prediction ...................................
    3

    1.2 Implementation of flight delay prediction pipeline using machine

    learning ...................................................................................................................
    5

    1.3 Some tips related to the flight delay prediction pipeline .......................
    9

    1.4 Formatting documents .........................................................................
    12

    1.4.1 Basic formatting standards for lab documents ..............................
    12

    2 Tasks of laboratory work ...........................................................................
    14

    2.1 The purpose of this practical work ......................................................
    14

    2.2 Stages of laboratory work ....................................................................
    14

    References .....................................................................................................
    17

    Appendix A Sample of design of the title page ..........................................
    18


    -- 2 of 19 --


    3

    1 THEORETIC WORK MATERIAL

    1.1 Theoretical background: flight delay prediction

    Flight delays are a widespread and impactful issue in modern aviation. Even

    small delays can cause large disruptions in scheduling, passenger satisfaction,
    and

    airline efficiency. Therefore, being able to predict flight delays can offer significant

    operational advantages to airlines, airports, and passengers.

    In the context of data science and machine learning, flight delay prediction is

    usually framed as a binary classification task: whether a flight will be delayed
    by

    more than 15 minutes (a common industry threshold). The challenge lies in the

    diverse and interrelated nature of the factors influencing delays, such as:

    − weather conditions (e.g., fog, thunderstorms, snow);

    − airline and aircraft operational factors;

    − airport congestion and location;

    − scheduled departure/arrival times (rush hours vs. night flights);

    − flight distance and route;

    − day of the week, holidays, and seasonality.

    Traditional rule-based systems struggle with the complexity and nonlinearity

    of these relationships. Machine learning (ML), however, is well-suited to this
    task

    because it can:

    − learn from large and noisy datasets with heterogeneous features;

    − model nonlinear relationships between weather, time, and operations;

    − adapt to changing patterns and generalize across flights and airports.

    Many studies (e.g., the U.S. Department of Transportation open flight dataset)

    have shown that machine learning methods can predict delays with reasonable

    accuracy. Popular algorithms used for this task include:

    − Logistic Regression (simple and interpretable);

    − Random Forests (robust and good baseline);

    − Gradient Boosting methods (e.g., XGBoost, LightGBM);

    − Support Vector Machines;


    -- 3 of 19 --


    4

    − Neural Networks (when large datasets and features are used).

    In the context of flight delay prediction, a typical machine learning pipeline

    consists of:

    1 Data acquisition – gathering historical flight data with columns like

    FlightDate, Airline, ScheduledDepTime, ArrDelay, WeatherDelay, Origin, and

    Destination;

    2 Preprocessing (focus of Laboratory Work 3):

    − cleaning and imputing missing values;

    − converting date/time into numerical features (hour, day of week,

    month);

    − encoding categorical features (airlines, airports);

    − scaling numeric variables (e.g., distance, delays);

    3 Exploratory Data Analysis (EDA):

    − analyzing delay distribution over time and across carriers;

    − identifying peak delay times and high-risk airports;

    − visualizing correlations between features and delay status;

    4 Model training and evaluation (also covered in Laboratory Work 3):

    − applying ML algorithms;

    − validating models using accuracy, AUC, and confusion matrix;

    − interpreting feature importance to understand key drivers of delays.

    Summary of Findings from Flight Delay Research:

    − weather and time-of-day are major predictors of delay;

    − flights departing late in the day are more likely to be delayed;

    − airport congestion and holidays introduce high variance;

    − gradient boosting methods often outperform simpler models in this task.

    This laboratory work will focus on implementing the pipeline using real-world

    data and comparing various classification models on their ability to predict flight

    delays.


    -- 4 of 19 --


    5

    In applied machine learning tasks such as flight delay prediction, the goal is

    not only to achieve accurate predictions but also to generate insights that can
    support

    operational decision-making in real-world systems.

    1.2 Implementation of flight delay prediction pipeline using machine

    learning

    In this laboratory work, we will use the “2015 Flight Delays and

    Cancellations” dataset from the U.S. Department of Transportation. This dataset

    includes flight-level records with scheduled and actual departure/arrival times,

    delays, carriers, airports, distance, and more. Use the flights.csv table from
    the

    dataset.

    We aim to build a binary classification model that predicts whether a flight

    will be delayed by more than 15 minutes upon arrival.

    Part 1: Setting Up the Environment

    Step 1: Create a Virtual Environment

    python -m venv flight_env

    Activate the environment

    flight_env\Scripts\activate

    Step 2: Install Required Libraries

    pip install pandas numpy scikit-learn matplotlib seaborn

    Step 3: Import the Libraries

    import pandas as pd

    import numpy as np


    -- 5 of 19 --


    6

    import matplotlib.pyplot as plt

    import seaborn as sns

    from sklearn.model_selection import train_test_split

    from sklearn.preprocessing import StandardScaler

    from sklearn.ensemble import RandomForestClassifier,

    GradientBoostingClassifier

    from sklearn.linear_model import LogisticRegression

    from sklearn.svm import SVC

    from sklearn.metrics import accuracy_score, classification_report,

    confusion_matrix

    Part 2: Load and Prepare the Dataset

    Step 1: Load the Dataset

    df = pd.read_csv("flights.csv", low_memory=False)

    df.head()

    Step 2: Define the Target Variable

    df[''is_delayed''] = (df[''ARRIVAL_DELAY''] > 15).astype(int)

    Step 3: Drop Unnecessary Columns

    We should remove the ''FLIGHT_NUMBER'' and ''TAIL_NUMBER'' columns,

    as they are unique to each flight and do not help predict delays. Such variables
    do

    not contain predictive information and may introduce noise into the model.

    Also, the ''CANCELLED'' and ''DIVERTED'' columns should be removed, as

    the model is supposed to predict delays, not cancellations or route changes. These

    fields can confuse the model because a flight can be canceled without delay.


    -- 6 of 19 --


    7

    df = df.drop(columns=[''FLIGHT_NUMBER'', ''TAIL_NUMBER'',

    ''CANCELLED'', ''DIVERTED''], errors=''ignore'')

    Part 3: Feature Engineering

    Step 1: Extract Time-Based Features

    # Convert to hour

    df[''DepHour''] = (df[''SCHEDULED_DEPARTURE''] // 100).astype(int)

    df[''ArrHour''] = (df[''SCHEDULED_ARRIVAL''] // 100).astype(int)

    # Extract day of the week

    df[''DayOfWeek''] = pd.to_datetime(df[[''YEAR'', ''MONTH'',

    ''DAY'']]).dt.dayofweek

    Step 2: Handle Missing Values

    Flight datasets often contain missing values due to reporting issues or

    cancelled flights. Since the model predicts arrival delay, rows with missing

    ARRIVAL_DELAY values are removed.

    df = df.dropna(subset=[''ARRIVAL_DELAY''])

    Part 4: Split the Dataset

    from sklearn.model_selection import train_test_split

    X = df.drop(columns=[''is_delayed'', ''ARRIVAL_DELAY''])

    y = df[''is_delayed'']

    X_train, X_test, y_train, y_test = train_test_split(

    X, y, test_size=0.3, random_state=42, stratify=y

    )

    Part 5: Encode Categorical Variables


    -- 7 of 19 --


    8

    cat_features = [''AIRLINE'', ''ORIGIN_AIRPORT'',

    ''DESTINATION_AIRPORT'']

    X_train = pd.get_dummies(X_train, columns=cat_features)

    X_test = pd.get_dummies(X_test, columns=cat_features)

    # Align train and test datasets to ensure identical columns

    X_train, X_test = X_train.align(X_test, join=''left'', axis=1, fill_value=0)

    Categorical variables are encoded after the train–test split to preserve the

    correct machine learning workflow. After one-hot encoding, the training and test

    datasets are aligned to ensure that both contain identical feature columns.

    Part 6: Scale Numerical Features

    scaler = StandardScaler()

    num_cols = [''DEPARTURE_DELAY'', ''SCHEDULED_DEPARTURE'',

    ''SCHEDULED_ARRIVAL'']

    X_train[num_cols] = scaler.fit_transform(X_train[num_cols])

    X_test[num_cols] = scaler.transform(X_test[num_cols])

    Part 7: Train and Evaluate Models

    from sklearn.ensemble import RandomForestClassifier

    from sklearn.metrics import accuracy_score, confusion_matrix,

    classification_report

    model = RandomForestClassifier(n_estimators=100, random_state=42)

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("Accuracy:", accuracy_score(y_test, y_pred))

    print(confusion_matrix(y_test, y_pred))


    -- 8 of 19 --


    9

    print(classification_report(y_test, y_pred))

    1.3 Some tips related to the flight delay prediction pipeline

    Building a reliable flight delay prediction system involves addressing multiple

    challenges in real-world data handling. Below are practical tips and strategies
    to

    improve the effectiveness, robustness, and interpretability of your machine learning

    pipeline:

    1 Create a Test Set Before Performing EDA

    It is crucial to create the train/test split before conducting exploratory data

    analysis (EDA) to avoid data snooping bias. Insights from EDA can unconsciously

    influence model design, leading to overfitting on the evaluation set.

    Recommendation:

    Use stratified sampling to ensure the test set preserves the proportion of

    delayed vs. non-delayed flights.

    X_train, X_test, y_train, y_test = train_test_split(

    X, y, stratify=y, test_size=0.3, random_state=42)

    2 Handle Missing Values Thoughtfully

    Flight datasets often contain missing values due to sensor failures, reporting

    delays, or inconsistent data entry.

    Table 1.1 - Approaches

    Situation Recommended Method

    Few missing values (<5%) Drop rows using dropna()

    Time-dependent variables Forward fill (ffill) or backward fill (bfill)

    Numerical variables Fill with mean() or median()

    Categorical variables Fill with mode()


    -- 9 of 19 --


    10

    End of table 1.1

    Situation Recommended Method

    Complex patterns Use KNNImputer or other predictive imputation

    Missing may be meaningful Create indicator variables and fill with extreme

    value (e.g., -999)

    Example:

    from sklearn.impute import KNNImputer

    imputer = KNNImputer(n_neighbors=5)

    X_train = imputer.fit_transform(X_train)

    X_test = imputer.transform(X_test)

    3 Time Features Need Special Attention

    Time columns such as CRSDepTime (scheduled departure time) are often

    recorded in HHMM format. These must be transformed carefully:

    − convert to hour (0–23) to capture daily patterns;

    − consider grouping hours (e.g., night, morning, afternoon, evening) for

    categorical modeling;

    − create weekday/weekend, month, or holiday flag columns.

    4 Be Careful with High-Cardinality Categorical Variables

    Airport codes (e.g., JFK, LAX, ORD) and carriers can have many unique

    values. If you use one-hot encoding:

    − apply it after splitting the data, to avoid leaking unseen categories from

    the test set;

    − align training and testing sets with align():

    − X_train, X_test = X_train.align(X_test, join=''left'', axis=1,

    fill_value=0)

    5 Normalize Numerical Features for Distance-Based Models


    -- 10 of 19 --


    11

    If you are using algorithms sensitive to feature scaling (e.g., SVM, Logistic

    Regression), it is recommended to scale numeric values using StandardScaler or

    MinMaxScaler.

    from sklearn.preprocessing import StandardScaler

    scaler = StandardScaler()

    X_train[num_cols] = scaler.fit_transform(X_train[num_cols])

    X_test[num_cols] = scaler.transform(X_test[num_cols])

    6 Evaluate Models with Balanced Metrics

    Because class imbalance (i.e., more on-time flights than delayed ones) is

    common, accuracy alone may not reflect true model quality. Use:

    − confusion matrix for TP, FP, FN, TN;

    − precision, recall, F1-score to assess balance;

    − ROC-AUC for overall separability;

    − KS Statistic to compare probability distributions.

    from sklearn.metrics import roc_auc_score

    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])

    7 Interpretability Matters in Transportation

    Even if a complex model performs better, simpler models (e.g., Logistic

    Regression, Decision Trees) offer better transparency, which is often required
    in the

    transport industry. Use:

    − feature importance plots;

    − SHAP or LIME for local explanations (optional advanced task);

    − aggregated feature statistics per class.

    By incorporating these practical strategies, students can ensure their models

    are both technically sound and applicable in real-world scenarios, especially
    in

    operational contexts such as airline management and delay mitigation systems.


    -- 11 of 19 --


    12

    1.4 Formatting documents

    1.4.1 Basic formatting standards for lab documents

    The report is prepared in the text editor MS Word [3]. You need to open the

    template at the link [4] and save the document in .docx format with the appropriate

    name, for example, Report_1_BCSMAI_Ivanov_KN_424.docx. This template is a

    set of styles that should be used when creating reports on laboratory work, this

    template also explains the cases of using one or another style, formatting and
    design

    of various elements of the report. Before making a report, you should study the

    requirements for making reports, which are given in the template and below the
    text.

    It is considered that the student has basic skills in MS Word (or similar editors,

    such as OpenOffice.org Writer).

    Document formatting refers to the way a document is laid out on the page—

    the way it looks and is visually organized—and it addresses things like font

    selection, font size and presentation (like bold or italics), spacing, margins,

    alignment, columns, indentation, and lists. Basically, the mechanics of how the

    words appear on the page. A well formatting document is consistent, correct (in

    terms of meeting any stated requirements), and easy to read [5].

    Basic formatting standards include:

    1 The report is made on sheets of A4 printing paper (297 mm x 210 mm). The

    margins must be: left, bottom and top - not less than 20 mm, right - not less
    than 10

    mm.

    2 14 pt. font in a consistent style throughout, including section headings and

    subsection headings, headers, footers, and visual labels. Font of notes, text
    elements

    in table can be 12 pt.

    3 A standard, professional font is Times New Roman.

    4 1.5 line spacing, with 1.25 indentation on the first line of the paragraph

    5 Body text text is aligned with both margins

    6 Page numbers at upper right corner (Arabic numerals). The number is not


    -- 12 of 19 --


    13

    placed on the title page, which is the first page of the document, but it is

    included in the general numbering (a sample of the title page for the report on

    laboratory work is given in Appendix A).

    Documents usually have some form of “logical structure”: division into

    chapters, sections, sub-sections etc. to organize its content. Each element of
    structure

    has corresponding heading, and heading of each part of document has own formtting

    standards:

    7 Heading of Section. New section begins with a new page (page break at the

    end of the previous part of the text). Formatting of heading of section: Times
    New

    Roman 14 pt., bold, Capital, center text, 1.5 line spacing, after heading 21 points.

    8 Heading of Subsection is separated from the text body by blank line.

    Formatting of heading of subsection: Times New Roman 14 pt., bold, justified text,

    1.25 indentation.

    9 Heading of Item is NOT separated by line from the text body. Formatting of

    heading of item:Times New Roman 14 pt., bold, justified text, 1.25 indentation.

    To automatically generate table of contents, you must first configure the styles

    of elements of structure.


    -- 13 of 19 --


    14

    2 TASKS OF LABORATORY WORK

    2.1 The purpose of this practical work

    This laboratory work challenges students to design and evaluate a machine

    learning system that predicts flight delays using real-world aviation data. Unlike

    conventional predictive tasks, this lab emphasizes:

    − interpretability of results for operational decision-making;

    − contextual analysis of features like time of day, airport traffic, and

    weather impact;

    − comparative model diagnostics including model stability and fairness;

    − development of insights into flight planning, optimization, and

    passenger experience.

    Through this work, students will gain experience in:

    − transforming complex temporal and categorical features;

    − handling imbalanced and noisy real-world data;

    − evaluating models in terms of not just accuracy but operational value;

    − visual storytelling with data through intuitive plots and aggregated

    comparisons;

    − designing practical recommendations based on predictive results.

    This task simulates a data scientist role in a transportation company, providing

    both technical and business value.

    2.2 Stages of laboratory work

    Students may complete the laboratory work using the provided flight delay

    dataset or apply the same machine learning workflow to a dataset related to their

    master’s thesis or research topic. In this case, the student must clearly formulate
    the

    prediction or analysis task and follow the same stages of exploratory data analysis,

    feature engineering, model training, evaluation, and interpretation described
    in this

    laboratory work.


    -- 14 of 19 --


    15

    The lab is structured in 6 main stages, each encouraging critical thinking and

    data-driven reasoning:

    Stage 1: Build a Delay Classifier

    − load and clean the dataset.

    − engineer at least three time-related features and encode at least two

    categorical variables.

    − create binary target: is_delayed (1 if arrival delay > 15 minutes).

    − prepare train/test split with stratification.

    Deliverable: Cleaned DataFrame with selected features + test set snapshot.

    Stage 2: Visual Flight Intelligence Dashboard (EDA)

    Use visualizations to answer the following questions:

    − which days of the week have the most delays?

    − are delays more common in the morning, afternoon or evening?

    − which airports or routes are most problematic?

    − are certain carriers more prone to delays?

    Recommended tools: Seaborn, groupby(), pivot_table(), heatmaps, and

    violin/box plots.

    Deliverable: At least 4 meaningful visualizations + brief interpretations for

    each.

    Stage 3: Train, Compare, and Analyze Models

    − train at least three models (e.g., Logistic Regression, Random Forest,

    Gradient Boosting).

    − use Accuracy, AUC, F1-score, confusion matrix for evaluation.

    − plot feature importance and discuss which variables matter most.

    − optionally test a threshold shift: what happens if we define delay as >

    30 min?

    Deliverable: Metrics comparison table summarizing model performance (e.g.,

    Accuracy, F1-score, AUC), model comparison discussion, and feature importance

    graph.

    Stage 4: Decision Support and Operational Recommendations


    -- 15 of 19 --


    16

    Imagine you work as a data analyst responsible for supporting decision-

    making in the selected application domain. Based on your analysis and model

    results:

    − what patterns or relationships have you discovered in the data?

    − which factors most strongly influence the target outcome?

    − what practical or operational recommendations could improve the

    system or process being analyzed?

    − which cases or situations appear most “at-risk” according to the model

    predictions?

    Deliverable: Short written case summary (0.5–1 page) with bullet-pointed,

    data-driven recommendations.

    Stage 5: Report creating

    After completing this laboratory work, students should prepare a report that

    includes the following sections:

    1) objective – a brief description of the purpose of this work;

    2) main steps – a summary of the key steps performed;

    3) results – key findings from the data analysis;

    4) screenshots – if necessary, students should provide screenshots of key

    outputs;

    5) knowledge and skills acquired – a reflection on what was learned and

    how these skills can be applied to real-world data analysis tasks.

    This structured report will ensure a comprehensive understanding of the

    practical work and enhance documentation skills.

    Stage 6: Defending

    Defend laboratory work individually: present results; answer questions related

    to the topic or the laboratory work.


    -- 16 of 19 --


    17

    REFERENCES

    1 Website to finding datasets https://www.kaggle.com.

    2 2015 Flight Delays and Cancellations dataset.

    https://www.kaggle.com/datasets/usdot/flight-delays

    3 Microsoft Support // https://support.microsoft.com/en-us/word?ui=en

    us&rs=en-us&ad=us, 09.03.2026

    4 Templates for reports on laboratory work //

    https://iiiii.sharepoint.com/:f:/s/Profs.PIITU/ErRwourAhj1AjM3szMwHEsgBcqyrl

    0_Ik8_xHIJp2A-lLQ?e=8nfxUH, 01.03.2026

    5 Chapter 8. Formatting Documents

    https://ohiostate.pressbooks.pub/feptechcomm/chapter/8-formatting/, 09.03.2026


    -- 17 of 19 --


    18

    APPENDIX A

    Sample of design of the title page

    MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    Institute (faculty) of Computer Sciences and Software Engineering

    Department of Software Engineering and Management Information Technology

    Program Subject Area 121 Software engineering

    Educational Software engineering __________

    Specialization _________________________________________________

    LABORATORY WORK №4 on course

    «Machine learning methods»

    Laboratory work subject Applied Machine Learning Workflow: Case Study and

    Practical Implementation

    Executed by student 1 year, group KN- N225

    Pavel ZHERZHERUNOV

    (signature, surname and name)

    Checked by Oksana IVASHCHENKO

    (signature, surname and name)

    Kharkiv 2026


    -- 18 of 19 --


    19

    MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    Institute (faculty) of Computer Sciences and Software Engineering

    Department of Software Engineering and Management Information Technology

    Program Subject Area 122 Computer science

    Educational Computer science and intelligent systems __________

    Specialization _________________________________________________

    LABORATORY WORK №4 on course

    «Machine learning methods»

    Laboratory work subject Applied Machine Learning Workflow: Case Study and

    Practical Implementation

    Executed by student 1 year, group KN- N425

    Pavel ZHERZHERUNOV

    (signature, surname and name)

    Checked by Oksana IVASHCHENKO

    (signature, surname and name)

    Kharkiv 2026


    -- 19 of 19 --


    '
  sentences:
  - Problem Management. Manages the life cycle of incidents and problems. Identifies
    and resolves the root cause of incidents. Takes a proactive approach to avoidance
    or identification of root cause of ICT problems. Deploys a knowledge system based
    on recurrence of common errors. Resolves or escalates incidents. Optimises system
    or component performance.
  - Problem Management. Manages the life cycle of incidents and problems. Identifies
    and resolves the root cause of incidents. Takes a proactive approach to avoidance
    or identification of root cause of ICT problems. Deploys a knowledge system based
    on recurrence of common errors. Resolves or escalates incidents. Optimises system
    or component performance.
  - Application Development. Interprets the application design to develop a suitable
    application in accordance with customer needs. Adapts existing solutions by e.g.
    porting an application to another operating system. Codes, debugs, tests and documents
    and communicates product development stages. Selects appropriate technical options
    for development such as reusing, improving or reconfiguration of existing components.
    Optimises efficiency, cost and quality. Validates results with user representatives,
    integrates and commissions the overall solution.
- source_sentence: 'MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    LABORATORY WORK №4

    “Applied Machine Learning Workflow: Case Study and Practical

    Implementation”

    on course «Machine learning methods»

    Kharkiv 2026


    -- 1 of 19 --


    2

    CONTENT

    1 Theoretic work material ...............................................................................
    3

    1.1 Theoretical background: flight delay prediction ...................................
    3

    1.2 Implementation of flight delay prediction pipeline using machine

    learning ...................................................................................................................
    5

    1.3 Some tips related to the flight delay prediction pipeline .......................
    9

    1.4 Formatting documents .........................................................................
    12

    1.4.1 Basic formatting standards for lab documents ..............................
    12

    2 Tasks of laboratory work ...........................................................................
    14

    2.1 The purpose of this practical work ......................................................
    14

    2.2 Stages of laboratory work ....................................................................
    14

    References .....................................................................................................
    17

    Appendix A Sample of design of the title page ..........................................
    18


    -- 2 of 19 --


    3

    1 THEORETIC WORK MATERIAL

    1.1 Theoretical background: flight delay prediction

    Flight delays are a widespread and impactful issue in modern aviation. Even

    small delays can cause large disruptions in scheduling, passenger satisfaction,
    and

    airline efficiency. Therefore, being able to predict flight delays can offer significant

    operational advantages to airlines, airports, and passengers.

    In the context of data science and machine learning, flight delay prediction is

    usually framed as a binary classification task: whether a flight will be delayed
    by

    more than 15 minutes (a common industry threshold). The challenge lies in the

    diverse and interrelated nature of the factors influencing delays, such as:

    − weather conditions (e.g., fog, thunderstorms, snow);

    − airline and aircraft operational factors;

    − airport congestion and location;

    − scheduled departure/arrival times (rush hours vs. night flights);

    − flight distance and route;

    − day of the week, holidays, and seasonality.

    Traditional rule-based systems struggle with the complexity and nonlinearity

    of these relationships. Machine learning (ML), however, is well-suited to this
    task

    because it can:

    − learn from large and noisy datasets with heterogeneous features;

    − model nonlinear relationships between weather, time, and operations;

    − adapt to changing patterns and generalize across flights and airports.

    Many studies (e.g., the U.S. Department of Transportation open flight dataset)

    have shown that machine learning methods can predict delays with reasonable

    accuracy. Popular algorithms used for this task include:

    − Logistic Regression (simple and interpretable);

    − Random Forests (robust and good baseline);

    − Gradient Boosting methods (e.g., XGBoost, LightGBM);

    − Support Vector Machines;


    -- 3 of 19 --


    4

    − Neural Networks (when large datasets and features are used).

    In the context of flight delay prediction, a typical machine learning pipeline

    consists of:

    1 Data acquisition – gathering historical flight data with columns like

    FlightDate, Airline, ScheduledDepTime, ArrDelay, WeatherDelay, Origin, and

    Destination;

    2 Preprocessing (focus of Laboratory Work 3):

    − cleaning and imputing missing values;

    − converting date/time into numerical features (hour, day of week,

    month);

    − encoding categorical features (airlines, airports);

    − scaling numeric variables (e.g., distance, delays);

    3 Exploratory Data Analysis (EDA):

    − analyzing delay distribution over time and across carriers;

    − identifying peak delay times and high-risk airports;

    − visualizing correlations between features and delay status;

    4 Model training and evaluation (also covered in Laboratory Work 3):

    − applying ML algorithms;

    − validating models using accuracy, AUC, and confusion matrix;

    − interpreting feature importance to understand key drivers of delays.

    Summary of Findings from Flight Delay Research:

    − weather and time-of-day are major predictors of delay;

    − flights departing late in the day are more likely to be delayed;

    − airport congestion and holidays introduce high variance;

    − gradient boosting methods often outperform simpler models in this task.

    This laboratory work will focus on implementing the pipeline using real-world

    data and comparing various classification models on their ability to predict flight

    delays.


    -- 4 of 19 --


    5

    In applied machine learning tasks such as flight delay prediction, the goal is

    not only to achieve accurate predictions but also to generate insights that can
    support

    operational decision-making in real-world systems.

    1.2 Implementation of flight delay prediction pipeline using machine

    learning

    In this laboratory work, we will use the “2015 Flight Delays and

    Cancellations” dataset from the U.S. Department of Transportation. This dataset

    includes flight-level records with scheduled and actual departure/arrival times,

    delays, carriers, airports, distance, and more. Use the flights.csv table from
    the

    dataset.

    We aim to build a binary classification model that predicts whether a flight

    will be delayed by more than 15 minutes upon arrival.

    Part 1: Setting Up the Environment

    Step 1: Create a Virtual Environment

    python -m venv flight_env

    Activate the environment

    flight_env\Scripts\activate

    Step 2: Install Required Libraries

    pip install pandas numpy scikit-learn matplotlib seaborn

    Step 3: Import the Libraries

    import pandas as pd

    import numpy as np


    -- 5 of 19 --


    6

    import matplotlib.pyplot as plt

    import seaborn as sns

    from sklearn.model_selection import train_test_split

    from sklearn.preprocessing import StandardScaler

    from sklearn.ensemble import RandomForestClassifier,

    GradientBoostingClassifier

    from sklearn.linear_model import LogisticRegression

    from sklearn.svm import SVC

    from sklearn.metrics import accuracy_score, classification_report,

    confusion_matrix

    Part 2: Load and Prepare the Dataset

    Step 1: Load the Dataset

    df = pd.read_csv("flights.csv", low_memory=False)

    df.head()

    Step 2: Define the Target Variable

    df[''is_delayed''] = (df[''ARRIVAL_DELAY''] > 15).astype(int)

    Step 3: Drop Unnecessary Columns

    We should remove the ''FLIGHT_NUMBER'' and ''TAIL_NUMBER'' columns,

    as they are unique to each flight and do not help predict delays. Such variables
    do

    not contain predictive information and may introduce noise into the model.

    Also, the ''CANCELLED'' and ''DIVERTED'' columns should be removed, as

    the model is supposed to predict delays, not cancellations or route changes. These

    fields can confuse the model because a flight can be canceled without delay.


    -- 6 of 19 --


    7

    df = df.drop(columns=[''FLIGHT_NUMBER'', ''TAIL_NUMBER'',

    ''CANCELLED'', ''DIVERTED''], errors=''ignore'')

    Part 3: Feature Engineering

    Step 1: Extract Time-Based Features

    # Convert to hour

    df[''DepHour''] = (df[''SCHEDULED_DEPARTURE''] // 100).astype(int)

    df[''ArrHour''] = (df[''SCHEDULED_ARRIVAL''] // 100).astype(int)

    # Extract day of the week

    df[''DayOfWeek''] = pd.to_datetime(df[[''YEAR'', ''MONTH'',

    ''DAY'']]).dt.dayofweek

    Step 2: Handle Missing Values

    Flight datasets often contain missing values due to reporting issues or

    cancelled flights. Since the model predicts arrival delay, rows with missing

    ARRIVAL_DELAY values are removed.

    df = df.dropna(subset=[''ARRIVAL_DELAY''])

    Part 4: Split the Dataset

    from sklearn.model_selection import train_test_split

    X = df.drop(columns=[''is_delayed'', ''ARRIVAL_DELAY''])

    y = df[''is_delayed'']

    X_train, X_test, y_train, y_test = train_test_split(

    X, y, test_size=0.3, random_state=42, stratify=y

    )

    Part 5: Encode Categorical Variables


    -- 7 of 19 --


    8

    cat_features = [''AIRLINE'', ''ORIGIN_AIRPORT'',

    ''DESTINATION_AIRPORT'']

    X_train = pd.get_dummies(X_train, columns=cat_features)

    X_test = pd.get_dummies(X_test, columns=cat_features)

    # Align train and test datasets to ensure identical columns

    X_train, X_test = X_train.align(X_test, join=''left'', axis=1, fill_value=0)

    Categorical variables are encoded after the train–test split to preserve the

    correct machine learning workflow. After one-hot encoding, the training and test

    datasets are aligned to ensure that both contain identical feature columns.

    Part 6: Scale Numerical Features

    scaler = StandardScaler()

    num_cols = [''DEPARTURE_DELAY'', ''SCHEDULED_DEPARTURE'',

    ''SCHEDULED_ARRIVAL'']

    X_train[num_cols] = scaler.fit_transform(X_train[num_cols])

    X_test[num_cols] = scaler.transform(X_test[num_cols])

    Part 7: Train and Evaluate Models

    from sklearn.ensemble import RandomForestClassifier

    from sklearn.metrics import accuracy_score, confusion_matrix,

    classification_report

    model = RandomForestClassifier(n_estimators=100, random_state=42)

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("Accuracy:", accuracy_score(y_test, y_pred))

    print(confusion_matrix(y_test, y_pred))


    -- 8 of 19 --


    9

    print(classification_report(y_test, y_pred))

    1.3 Some tips related to the flight delay prediction pipeline

    Building a reliable flight delay prediction system involves addressing multiple

    challenges in real-world data handling. Below are practical tips and strategies
    to

    improve the effectiveness, robustness, and interpretability of your machine learning

    pipeline:

    1 Create a Test Set Before Performing EDA

    It is crucial to create the train/test split before conducting exploratory data

    analysis (EDA) to avoid data snooping bias. Insights from EDA can unconsciously

    influence model design, leading to overfitting on the evaluation set.

    Recommendation:

    Use stratified sampling to ensure the test set preserves the proportion of

    delayed vs. non-delayed flights.

    X_train, X_test, y_train, y_test = train_test_split(

    X, y, stratify=y, test_size=0.3, random_state=42)

    2 Handle Missing Values Thoughtfully

    Flight datasets often contain missing values due to sensor failures, reporting

    delays, or inconsistent data entry.

    Table 1.1 - Approaches

    Situation Recommended Method

    Few missing values (<5%) Drop rows using dropna()

    Time-dependent variables Forward fill (ffill) or backward fill (bfill)

    Numerical variables Fill with mean() or median()

    Categorical variables Fill with mode()


    -- 9 of 19 --


    10

    End of table 1.1

    Situation Recommended Method

    Complex patterns Use KNNImputer or other predictive imputation

    Missing may be meaningful Create indicator variables and fill with extreme

    value (e.g., -999)

    Example:

    from sklearn.impute import KNNImputer

    imputer = KNNImputer(n_neighbors=5)

    X_train = imputer.fit_transform(X_train)

    X_test = imputer.transform(X_test)

    3 Time Features Need Special Attention

    Time columns such as CRSDepTime (scheduled departure time) are often

    recorded in HHMM format. These must be transformed carefully:

    − convert to hour (0–23) to capture daily patterns;

    − consider grouping hours (e.g., night, morning, afternoon, evening) for

    categorical modeling;

    − create weekday/weekend, month, or holiday flag columns.

    4 Be Careful with High-Cardinality Categorical Variables

    Airport codes (e.g., JFK, LAX, ORD) and carriers can have many unique

    values. If you use one-hot encoding:

    − apply it after splitting the data, to avoid leaking unseen categories from

    the test set;

    − align training and testing sets with align():

    − X_train, X_test = X_train.align(X_test, join=''left'', axis=1,

    fill_value=0)

    5 Normalize Numerical Features for Distance-Based Models


    -- 10 of 19 --


    11

    If you are using algorithms sensitive to feature scaling (e.g., SVM, Logistic

    Regression), it is recommended to scale numeric values using StandardScaler or

    MinMaxScaler.

    from sklearn.preprocessing import StandardScaler

    scaler = StandardScaler()

    X_train[num_cols] = scaler.fit_transform(X_train[num_cols])

    X_test[num_cols] = scaler.transform(X_test[num_cols])

    6 Evaluate Models with Balanced Metrics

    Because class imbalance (i.e., more on-time flights than delayed ones) is

    common, accuracy alone may not reflect true model quality. Use:

    − confusion matrix for TP, FP, FN, TN;

    − precision, recall, F1-score to assess balance;

    − ROC-AUC for overall separability;

    − KS Statistic to compare probability distributions.

    from sklearn.metrics import roc_auc_score

    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])

    7 Interpretability Matters in Transportation

    Even if a complex model performs better, simpler models (e.g., Logistic

    Regression, Decision Trees) offer better transparency, which is often required
    in the

    transport industry. Use:

    − feature importance plots;

    − SHAP or LIME for local explanations (optional advanced task);

    − aggregated feature statistics per class.

    By incorporating these practical strategies, students can ensure their models

    are both technically sound and applicable in real-world scenarios, especially
    in

    operational contexts such as airline management and delay mitigation systems.


    -- 11 of 19 --


    12

    1.4 Formatting documents

    1.4.1 Basic formatting standards for lab documents

    The report is prepared in the text editor MS Word [3]. You need to open the

    template at the link [4] and save the document in .docx format with the appropriate

    name, for example, Report_1_BCSMAI_Ivanov_KN_424.docx. This template is a

    set of styles that should be used when creating reports on laboratory work, this

    template also explains the cases of using one or another style, formatting and
    design

    of various elements of the report. Before making a report, you should study the

    requirements for making reports, which are given in the template and below the
    text.

    It is considered that the student has basic skills in MS Word (or similar editors,

    such as OpenOffice.org Writer).

    Document formatting refers to the way a document is laid out on the page—

    the way it looks and is visually organized—and it addresses things like font

    selection, font size and presentation (like bold or italics), spacing, margins,

    alignment, columns, indentation, and lists. Basically, the mechanics of how the

    words appear on the page. A well formatting document is consistent, correct (in

    terms of meeting any stated requirements), and easy to read [5].

    Basic formatting standards include:

    1 The report is made on sheets of A4 printing paper (297 mm x 210 mm). The

    margins must be: left, bottom and top - not less than 20 mm, right - not less
    than 10

    mm.

    2 14 pt. font in a consistent style throughout, including section headings and

    subsection headings, headers, footers, and visual labels. Font of notes, text
    elements

    in table can be 12 pt.

    3 A standard, professional font is Times New Roman.

    4 1.5 line spacing, with 1.25 indentation on the first line of the paragraph

    5 Body text text is aligned with both margins

    6 Page numbers at upper right corner (Arabic numerals). The number is not


    -- 12 of 19 --


    13

    placed on the title page, which is the first page of the document, but it is

    included in the general numbering (a sample of the title page for the report on

    laboratory work is given in Appendix A).

    Documents usually have some form of “logical structure”: division into

    chapters, sections, sub-sections etc. to organize its content. Each element of
    structure

    has corresponding heading, and heading of each part of document has own formtting

    standards:

    7 Heading of Section. New section begins with a new page (page break at the

    end of the previous part of the text). Formatting of heading of section: Times
    New

    Roman 14 pt., bold, Capital, center text, 1.5 line spacing, after heading 21 points.

    8 Heading of Subsection is separated from the text body by blank line.

    Formatting of heading of subsection: Times New Roman 14 pt., bold, justified text,

    1.25 indentation.

    9 Heading of Item is NOT separated by line from the text body. Formatting of

    heading of item:Times New Roman 14 pt., bold, justified text, 1.25 indentation.

    To automatically generate table of contents, you must first configure the styles

    of elements of structure.


    -- 13 of 19 --


    14

    2 TASKS OF LABORATORY WORK

    2.1 The purpose of this practical work

    This laboratory work challenges students to design and evaluate a machine

    learning system that predicts flight delays using real-world aviation data. Unlike

    conventional predictive tasks, this lab emphasizes:

    − interpretability of results for operational decision-making;

    − contextual analysis of features like time of day, airport traffic, and

    weather impact;

    − comparative model diagnostics including model stability and fairness;

    − development of insights into flight planning, optimization, and

    passenger experience.

    Through this work, students will gain experience in:

    − transforming complex temporal and categorical features;

    − handling imbalanced and noisy real-world data;

    − evaluating models in terms of not just accuracy but operational value;

    − visual storytelling with data through intuitive plots and aggregated

    comparisons;

    − designing practical recommendations based on predictive results.

    This task simulates a data scientist role in a transportation company, providing

    both technical and business value.

    2.2 Stages of laboratory work

    Students may complete the laboratory work using the provided flight delay

    dataset or apply the same machine learning workflow to a dataset related to their

    master’s thesis or research topic. In this case, the student must clearly formulate
    the

    prediction or analysis task and follow the same stages of exploratory data analysis,

    feature engineering, model training, evaluation, and interpretation described
    in this

    laboratory work.


    -- 14 of 19 --


    15

    The lab is structured in 6 main stages, each encouraging critical thinking and

    data-driven reasoning:

    Stage 1: Build a Delay Classifier

    − load and clean the dataset.

    − engineer at least three time-related features and encode at least two

    categorical variables.

    − create binary target: is_delayed (1 if arrival delay > 15 minutes).

    − prepare train/test split with stratification.

    Deliverable: Cleaned DataFrame with selected features + test set snapshot.

    Stage 2: Visual Flight Intelligence Dashboard (EDA)

    Use visualizations to answer the following questions:

    − which days of the week have the most delays?

    − are delays more common in the morning, afternoon or evening?

    − which airports or routes are most problematic?

    − are certain carriers more prone to delays?

    Recommended tools: Seaborn, groupby(), pivot_table(), heatmaps, and

    violin/box plots.

    Deliverable: At least 4 meaningful visualizations + brief interpretations for

    each.

    Stage 3: Train, Compare, and Analyze Models

    − train at least three models (e.g., Logistic Regression, Random Forest,

    Gradient Boosting).

    − use Accuracy, AUC, F1-score, confusion matrix for evaluation.

    − plot feature importance and discuss which variables matter most.

    − optionally test a threshold shift: what happens if we define delay as >

    30 min?

    Deliverable: Metrics comparison table summarizing model performance (e.g.,

    Accuracy, F1-score, AUC), model comparison discussion, and feature importance

    graph.

    Stage 4: Decision Support and Operational Recommendations


    -- 15 of 19 --


    16

    Imagine you work as a data analyst responsible for supporting decision-

    making in the selected application domain. Based on your analysis and model

    results:

    − what patterns or relationships have you discovered in the data?

    − which factors most strongly influence the target outcome?

    − what practical or operational recommendations could improve the

    system or process being analyzed?

    − which cases or situations appear most “at-risk” according to the model

    predictions?

    Deliverable: Short written case summary (0.5–1 page) with bullet-pointed,

    data-driven recommendations.

    Stage 5: Report creating

    After completing this laboratory work, students should prepare a report that

    includes the following sections:

    1) objective – a brief description of the purpose of this work;

    2) main steps – a summary of the key steps performed;

    3) results – key findings from the data analysis;

    4) screenshots – if necessary, students should provide screenshots of key

    outputs;

    5) knowledge and skills acquired – a reflection on what was learned and

    how these skills can be applied to real-world data analysis tasks.

    This structured report will ensure a comprehensive understanding of the

    practical work and enhance documentation skills.

    Stage 6: Defending

    Defend laboratory work individually: present results; answer questions related

    to the topic or the laboratory work.


    -- 16 of 19 --


    17

    REFERENCES

    1 Website to finding datasets https://www.kaggle.com.

    2 2015 Flight Delays and Cancellations dataset.

    https://www.kaggle.com/datasets/usdot/flight-delays

    3 Microsoft Support // https://support.microsoft.com/en-us/word?ui=en

    us&rs=en-us&ad=us, 09.03.2026

    4 Templates for reports on laboratory work //

    https://iiiii.sharepoint.com/:f:/s/Profs.PIITU/ErRwourAhj1AjM3szMwHEsgBcqyrl

    0_Ik8_xHIJp2A-lLQ?e=8nfxUH, 01.03.2026

    5 Chapter 8. Formatting Documents

    https://ohiostate.pressbooks.pub/feptechcomm/chapter/8-formatting/, 09.03.2026


    -- 17 of 19 --


    18

    APPENDIX A

    Sample of design of the title page

    MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    Institute (faculty) of Computer Sciences and Software Engineering

    Department of Software Engineering and Management Information Technology

    Program Subject Area 121 Software engineering

    Educational Software engineering __________

    Specialization _________________________________________________

    LABORATORY WORK №4 on course

    «Machine learning methods»

    Laboratory work subject Applied Machine Learning Workflow: Case Study and

    Practical Implementation

    Executed by student 1 year, group KN- N225

    Pavel ZHERZHERUNOV

    (signature, surname and name)

    Checked by Oksana IVASHCHENKO

    (signature, surname and name)

    Kharkiv 2026


    -- 18 of 19 --


    19

    MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE

    NATIONAL TECHNICAL UNIVERSITY

    “KHARKIV POLYTECHNICAL INSTITUTE”

    Institute (faculty) of Computer Sciences and Software Engineering

    Department of Software Engineering and Management Information Technology

    Program Subject Area 122 Computer science

    Educational Computer science and intelligent systems __________

    Specialization _________________________________________________

    LABORATORY WORK №4 on course

    «Machine learning methods»

    Laboratory work subject Applied Machine Learning Workflow: Case Study and

    Practical Implementation

    Executed by student 1 year, group KN- N425

    Pavel ZHERZHERUNOV

    (signature, surname and name)

    Checked by Oksana IVASHCHENKO

    (signature, surname and name)

    Kharkiv 2026


    -- 19 of 19 --


    '
  sentences:
  - Problem Management. Manages the life cycle of incidents and problems. Identifies
    and resolves the root cause of incidents. Takes a proactive approach to avoidance
    or identification of root cause of ICT problems. Deploys a knowledge system based
    on recurrence of common errors. Resolves or escalates incidents. Optimises system
    or component performance.
  - Problem Management. Manages the life cycle of incidents and problems. Identifies
    and resolves the root cause of incidents. Takes a proactive approach to avoidance
    or identification of root cause of ICT problems. Deploys a knowledge system based
    on recurrence of common errors. Resolves or escalates incidents. Optimises system
    or component performance.
  - Application Design. Analyses, specifies, updates and makes available a model to
    implement applications in accordance with IS policy and user/customer needs. Selects
    appropriate technical options for application design, optimising the balance between
    cost and quality. Designs data structures and builds system structure models according
    to analysis results through modelling languages. Ensures that all aspects take
    account of interoperability, usability, accessibility and security. Identifies
    a common reference framework to validate the models with representative users,
    based upon development models (e.g. iterative approach).
- source_sentence: The student must be able to analyze software requirements and develop
    database architecture. Knowledge of the programming languages ​​Python and JavaScript
    is required. It is also necessary to be able to create user interfaces using React
    and store data using SQL."
  sentences:
  - Application Design. Analyses, specifies, updates and makes available a model to
    implement applications in accordance with IS policy and user/customer needs. Selects
    appropriate technical options for application design, optimising the balance between
    cost and quality. Designs data structures and builds system structure models according
    to analysis results through modelling languages. Ensures that all aspects take
    account of interoperability, usability, accessibility and security. Identifies
    a common reference framework to validate the models with representative users,
    based upon development models (e.g. iterative approach).
  - ICT Systems Engineering. Builds the required networks/network connections, components
    and interfaces. Follows a systematic methodology to analyse and engineer infrastructure
    platforms or solutions for cloud, IoT and other technologies to meet business
    and technical requirements. Builds system structure models and conducts system
    behaviour to integrate physical devices, networks, hardware and/or software components.
    Ensures information security, data protection and energy efficiency. Performs
    tests to ensure requirements are met.
  - ICT Systems Engineering. Builds the required networks/network connections, components
    and interfaces. Follows a systematic methodology to analyse and engineer infrastructure
    platforms or solutions for cloud, IoT and other technologies to meet business
    and technical requirements. Builds system structure models and conducts system
    behaviour to integrate physical devices, networks, hardware and/or software components.
    Ensures information security, data protection and energy efficiency. Performs
    tests to ensure requirements are met.
pipeline_tag: sentence-similarity
library_name: sentence-transformers
---

# SentenceTransformer based on sentence-transformers/all-MiniLM-L6-v2

This is a [sentence-transformers](https://www.SBERT.net) model finetuned from [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). It maps sentences & paragraphs to a 384-dimensional dense vector space and can be used for retrieval.

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
- **Base model:** [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) <!-- at revision c9745ed1d9f207416be6d2e6f8de32d1f16199bf -->
- **Maximum Sequence Length:** 256 tokens
- **Output Dimensionality:** 384 dimensions
- **Similarity Function:** Cosine Similarity
- **Supported Modality:** Text
<!-- - **Training Dataset:** Unknown -->
<!-- - **Language:** Unknown -->
<!-- - **License:** Unknown -->

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/huggingface/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): Transformer({'transformer_task': 'feature-extraction', 'modality_config': {'text': {'method': 'forward', 'method_output_name': 'last_hidden_state'}}, 'module_output_name': 'token_embeddings', 'architecture': 'BertModel'})
  (1): Pooling({'embedding_dimension': 384, 'pooling_mode': 'mean', 'include_prompt': True})
  (2): Normalize({})
)
```

## Usage

### Direct Usage (Sentence Transformers)

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```
Then you can load this model and run inference.
```python
from sentence_transformers import SentenceTransformer

# Download from the 🤗 Hub
model = SentenceTransformer("sentence_transformers_model_id")
# Run inference
sentences = [
    'The student must be able to analyze software requirements and develop database architecture. Knowledge of the programming languages \u200b\u200bPython and JavaScript is required. It is also necessary to be able to create user interfaces using React and store data using SQL."',
    'ICT Systems Engineering. Builds the required networks/network connections, components and interfaces. Follows a systematic methodology to analyse and engineer infrastructure platforms or solutions for cloud, IoT and other technologies to meet business and technical requirements. Builds system structure models and conducts system behaviour to integrate physical devices, networks, hardware and/or software components. Ensures information security, data protection and energy efficiency. Performs tests to ensure requirements are met.',
    'Application Design. Analyses, specifies, updates and makes available a model to implement applications in accordance with IS policy and user/customer needs. Selects appropriate technical options for application design, optimising the balance between cost and quality. Designs data structures and builds system structure models according to analysis results through modelling languages. Ensures that all aspects take account of interoperability, usability, accessibility and security. Identifies a common reference framework to validate the models with representative users, based upon development models (e.g. iterative approach).',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 384]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities)
# tensor([[1.0000, 0.0124, 0.4176],
#         [0.0124, 1.0000, 0.4091],
#         [0.4176, 0.4091, 1.0000]])
```
<!--
### Direct Usage (Transformers)

<details><summary>Click to see the direct usage in Transformers</summary>

</details>
-->

<!--
### Downstream Usage (Sentence Transformers)

You can finetune this model on your own dataset.

<details><summary>Click to expand</summary>

</details>
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Dataset

#### Unnamed Dataset

* Size: 22 training samples
* Columns: <code>sentence_0</code>, <code>sentence_1</code>, and <code>sentence_2</code>
* Approximate statistics based on the first 22 samples:
  |          | sentence_0                                                                           | sentence_1                                                                          | sentence_2                                                                          |
  |:---------|:-------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------|
  | type     | string                                                                               | string                                                                              | string                                                                              |
  | modality | text                                                                                 | text                                                                                | text                                                                                |
  | details  | <ul><li>min: 48 tokens</li><li>mean: 203.09 tokens</li><li>max: 256 tokens</li></ul> | <ul><li>min: 70 tokens</li><li>mean: 83.95 tokens</li><li>max: 109 tokens</li></ul> | <ul><li>min: 70 tokens</li><li>mean: 79.64 tokens</li><li>max: 109 tokens</li></ul> |
* Samples:
  | sentence_0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | sentence_1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | sentence_2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
  |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE<br>NATIONAL TECHNICAL UNIVERSITY<br>“KHARKIV POLYTECHNICAL INSTITUTE”<br>LABORATORY WORK № 2<br>“Practical Work: Customer Churn Prediction Using Machine Learning”<br>on course “Machine learning methods”<br>Kharkiv 2026<br><br>-- 1 of 34 --<br><br>2<br>CONTENT<br>1 Theoretic work material ...........................................................................3<br>1.1 Theoretical background: customer churn prediction ..................3<br>1.2 Implementation of customer churn prediction pipeline using machine<br>learning ....................................................................................................5<br>1.3 Some tips related to churn prediction pipeline ...............................19<br>1.4 Formatting documents.....................................................................26<br>1.4.1 Basic formatting standards for lab documents .........................26<br>2 Tasks of laboratory work .......................................................................29<br>2.1 The ...</code> | <code>Needs Identification. Actively listens to internal/ external customers, articulates and clarifies their needs. Manages the relationship with all stakeholders to ensure that solutions and services are in line with business requirements. Proposes different solutions (e.g. make-or-buy), by performing contextual analysis in support of user centered system design. Advises the customer on appropriate solution choices. Acts as an advocate engaging in the implementation or configuration process of the chosen solution.</code>                                     | <code>Digital Marketing. Understands the fundamental principles of digital marketing. Distinguishes between the traditional and digital approaches. Appreciates the range of channels available. Assesses the effectiveness of the various approaches and applies rigorous measurement techniques. Plans a coherent strategy using the most effective means available. Understands the data protection and privacy issues involved in the implementation of the marketing strategy.</code>                                                                          |
  | <code>The student must be able to analyze software requirements and develop database architecture. Knowledge of the programming languages ​​Python and JavaScript is required. It is also necessary to be able to create user interfaces using React and store data using SQL."</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | <code>Application Development. Interprets the application design to develop a suitable application in accordance with customer needs. Adapts existing solutions by e.g. porting an application to another operating system. Codes, debugs, tests and documents and communicates product development stages. Selects appropriate technical options for development such as reusing, improving or reconfiguration of existing components. Optimises efficiency, cost and quality. Validates results with user representatives, integrates and commissions the overall solution.</code> | <code>ICT Systems Engineering. Builds the required networks/network connections, components and interfaces. Follows a systematic methodology to analyse and engineer infrastructure platforms or solutions for cloud, IoT and other technologies to meet business and technical requirements. Builds system structure models and conducts system behaviour to integrate physical devices, networks, hardware and/or software components. Ensures information security, data protection and energy efficiency. Performs tests to ensure requirements are met.</code> |
  | <code>MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE<br>NATIONAL TECHNICAL UNIVERSITY<br>“KHARKIV POLYTECHNICAL INSTITUTE”<br>LABORATORY WORK № 2<br>“Practical Work: Customer Churn Prediction Using Machine Learning”<br>on course “Machine learning methods”<br>Kharkiv 2026<br><br>-- 1 of 34 --<br><br>2<br>CONTENT<br>1 Theoretic work material ...........................................................................3<br>1.1 Theoretical background: customer churn prediction ..................3<br>1.2 Implementation of customer churn prediction pipeline using machine<br>learning ....................................................................................................5<br>1.3 Some tips related to churn prediction pipeline ...............................19<br>1.4 Formatting documents.....................................................................26<br>1.4.1 Basic formatting standards for lab documents .........................26<br>2 Tasks of laboratory work .......................................................................29<br>2.1 The ...</code> | <code>Digital Marketing. Understands the fundamental principles of digital marketing. Distinguishes between the traditional and digital approaches. Appreciates the range of channels available. Assesses the effectiveness of the various approaches and applies rigorous measurement techniques. Plans a coherent strategy using the most effective means available. Understands the data protection and privacy issues involved in the implementation of the marketing strategy.</code>                                                                                           | <code>Digital Marketing. Understands the fundamental principles of digital marketing. Distinguishes between the traditional and digital approaches. Appreciates the range of channels available. Assesses the effectiveness of the various approaches and applies rigorous measurement techniques. Plans a coherent strategy using the most effective means available. Understands the data protection and privacy issues involved in the implementation of the marketing strategy.</code>                                                                          |
* Loss: [<code>TripletLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#tripletloss) with these parameters:
  ```json
  {
      "distance_metric": "TripletDistanceMetric.COSINE",
      "triplet_margin": 0.5
  }
  ```

### Training Hyperparameters
#### Non-Default Hyperparameters

- `per_device_train_batch_size`: 4
- `num_train_epochs`: 4
- `per_device_eval_batch_size`: 4
- `multi_dataset_batch_sampler`: round_robin

#### All Hyperparameters
<details><summary>Click to expand</summary>

- `per_device_train_batch_size`: 4
- `num_train_epochs`: 4
- `max_steps`: -1
- `learning_rate`: 5e-05
- `lr_scheduler_type`: linear
- `lr_scheduler_kwargs`: None
- `warmup_steps`: 0
- `optim`: adamw_torch_fused
- `optim_args`: None
- `weight_decay`: 0.0
- `adam_beta1`: 0.9
- `adam_beta2`: 0.999
- `adam_epsilon`: 1e-08
- `optim_target_modules`: None
- `gradient_accumulation_steps`: 1
- `average_tokens_across_devices`: True
- `max_grad_norm`: 1
- `label_smoothing_factor`: 0.0
- `bf16`: False
- `fp16`: False
- `bf16_full_eval`: False
- `fp16_full_eval`: False
- `tf32`: None
- `gradient_checkpointing`: False
- `gradient_checkpointing_kwargs`: None
- `torch_compile`: False
- `torch_compile_backend`: None
- `torch_compile_mode`: None
- `use_liger_kernel`: False
- `liger_kernel_config`: None
- `use_cache`: False
- `neftune_noise_alpha`: None
- `torch_empty_cache_steps`: None
- `auto_find_batch_size`: False
- `log_on_each_node`: True
- `logging_nan_inf_filter`: True
- `include_num_input_tokens_seen`: no
- `log_level`: passive
- `log_level_replica`: warning
- `disable_tqdm`: False
- `project`: huggingface
- `trackio_space_id`: None
- `trackio_bucket_id`: None
- `trackio_static_space_id`: None
- `per_device_eval_batch_size`: 4
- `prediction_loss_only`: True
- `eval_on_start`: False
- `eval_do_concat_batches`: True
- `eval_use_gather_object`: False
- `eval_accumulation_steps`: None
- `include_for_metrics`: []
- `batch_eval_metrics`: False
- `save_only_model`: False
- `save_on_each_node`: False
- `enable_jit_checkpoint`: False
- `push_to_hub`: False
- `hub_private_repo`: None
- `hub_model_id`: None
- `hub_strategy`: every_save
- `hub_always_push`: False
- `hub_revision`: None
- `load_best_model_at_end`: False
- `ignore_data_skip`: False
- `restore_callback_states_from_checkpoint`: False
- `full_determinism`: False
- `seed`: 42
- `data_seed`: None
- `use_cpu`: False
- `accelerator_config`: {'split_batches': False, 'dispatch_batches': None, 'even_batches': True, 'use_seedable_sampler': True, 'non_blocking': False, 'gradient_accumulation_kwargs': None}
- `parallelism_config`: None
- `dataloader_drop_last`: False
- `dataloader_num_workers`: 0
- `dataloader_pin_memory`: True
- `dataloader_persistent_workers`: False
- `dataloader_prefetch_factor`: None
- `remove_unused_columns`: True
- `label_names`: None
- `train_sampling_strategy`: random
- `length_column_name`: length
- `ddp_find_unused_parameters`: None
- `ddp_bucket_cap_mb`: None
- `ddp_broadcast_buffers`: False
- `ddp_static_graph`: None
- `ddp_backend`: None
- `ddp_timeout`: 1800
- `fsdp`: []
- `fsdp_config`: {'min_num_params': 0, 'xla': False, 'xla_fsdp_v2': False, 'xla_fsdp_grad_ckpt': False}
- `deepspeed`: None
- `debug`: []
- `skip_memory_metrics`: True
- `do_predict`: False
- `resume_from_checkpoint`: None
- `warmup_ratio`: None
- `local_rank`: -1
- `prompts`: None
- `batch_sampler`: batch_sampler
- `multi_dataset_batch_sampler`: round_robin
- `router_mapping`: {}
- `learning_rate_mapping`: {}

</details>

### Training Time
- **Training**: 1.2 minutes

### Framework Versions
- Python: 3.14.0
- Sentence Transformers: 5.5.0
- Transformers: 5.8.1
- PyTorch: 2.12.0+cpu
- Accelerate: 1.13.0
- Datasets: 4.8.5
- Tokenizers: 0.22.2

## Citation

### BibTeX

#### Sentence Transformers
```bibtex
@inproceedings{reimers-2019-sentence-bert,
    title = "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    author = "Reimers, Nils and Gurevych, Iryna",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing",
    month = "11",
    year = "2019",
    publisher = "Association for Computational Linguistics",
    url = "https://arxiv.org/abs/1908.10084",
}
```

#### TripletLoss
```bibtex
@misc{hermans2017defense,
    title={In Defense of the Triplet Loss for Person Re-Identification},
    author={Alexander Hermans and Lucas Beyer and Bastian Leibe},
    year={2017},
    eprint={1703.07737},
    archivePrefix={arXiv},
    primaryClass={cs.CV}
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

<!--
## Model Card Authors

*Lists the people who create the model card, providing recognition and accountability for the detailed work that goes into its construction.*
-->

<!--
## Model Card Contact

*Provides a way for people who have updates to the Model Card, suggestions, or questions, to contact the Model Card authors.*
-->