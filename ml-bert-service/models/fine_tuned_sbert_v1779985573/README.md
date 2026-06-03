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
  - Problem Management. Manages the life cycle of incidents and problems. Identifies
    and resolves the root cause of incidents. Takes a proactive approach to avoidance
    or identification of root cause of ICT problems. Deploys a knowledge system based
    on recurrence of common errors. Resolves or escalates incidents. Optimises system
    or component performance.
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
  - Problem Management. Manages the life cycle of incidents and problems. Identifies
    and resolves the root cause of incidents. Takes a proactive approach to avoidance
    or identification of root cause of ICT problems. Deploys a knowledge system based
    on recurrence of common errors. Resolves or escalates incidents. Optimises system
    or component performance.
  - Documentation Production. Produces documents by integrating information and maintaining
    compliance with relevant requirements. Selects the appropriate style and format
    by determining the media type and presentation mode of the documentation. Creates
    templates for document-management systems. Ensures that documentation complies
    with customers’, technical and ICT application development process needs and that
    existing documents are valid and up to date. Provides support for the development
    of interactive documents.
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
  - Problem Management. Manages the life cycle of incidents and problems. Identifies
    and resolves the root cause of incidents. Takes a proactive approach to avoidance
    or identification of root cause of ICT problems. Deploys a knowledge system based
    on recurrence of common errors. Resolves or escalates incidents. Optimises system
    or component performance.
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
    'MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE\nNATIONAL TECHNICAL UNIVERSITY\n“KHARKIV POLYTECHNICAL INSTITUTE”\nLABORATORY WORK №4\n“Applied Machine Learning Workflow: Case Study and Practical\nImplementation”\non course «Machine learning methods»\nKharkiv 2026\n\n-- 1 of 19 --\n\n2\nCONTENT\n1 Theoretic work material ............................................................................... 3\n1.1 Theoretical background: flight delay prediction ................................... 3\n1.2 Implementation of flight delay prediction pipeline using machine\nlearning ................................................................................................................... 5\n1.3 Some tips related to the flight delay prediction pipeline ....................... 9\n1.4 Formatting documents ......................................................................... 12\n1.4.1 Basic formatting standards for lab documents .............................. 12\n2 Tasks of laboratory work ........................................................................... 14\n2.1 The purpose of this practical work ...................................................... 14\n2.2 Stages of laboratory work .................................................................... 14\nReferences ..................................................................................................... 17\nAppendix A Sample of design of the title page .......................................... 18\n\n-- 2 of 19 --\n\n3\n1 THEORETIC WORK MATERIAL\n1.1 Theoretical background: flight delay prediction\nFlight delays are a widespread and impactful issue in modern aviation. Even\nsmall delays can cause large disruptions in scheduling, passenger satisfaction, and\nairline efficiency. Therefore, being able to predict flight delays can offer significant\noperational advantages to airlines, airports, and passengers.\nIn the context of data science and machine learning, flight delay prediction is\nusually framed as a binary classification task: whether a flight will be delayed by\nmore than 15 minutes (a common industry threshold). The challenge lies in the\ndiverse and interrelated nature of the factors influencing delays, such as:\n− weather conditions (e.g., fog, thunderstorms, snow);\n− airline and aircraft operational factors;\n− airport congestion and location;\n− scheduled departure/arrival times (rush hours vs. night flights);\n− flight distance and route;\n− day of the week, holidays, and seasonality.\nTraditional rule-based systems struggle with the complexity and nonlinearity\nof these relationships. Machine learning (ML), however, is well-suited to this task\nbecause it can:\n− learn from large and noisy datasets with heterogeneous features;\n− model nonlinear relationships between weather, time, and operations;\n− adapt to changing patterns and generalize across flights and airports.\nMany studies (e.g., the U.S. Department of Transportation open flight dataset)\nhave shown that machine learning methods can predict delays with reasonable\naccuracy. Popular algorithms used for this task include:\n− Logistic Regression (simple and interpretable);\n− Random Forests (robust and good baseline);\n− Gradient Boosting methods (e.g., XGBoost, LightGBM);\n− Support Vector Machines;\n\n-- 3 of 19 --\n\n4\n− Neural Networks (when large datasets and features are used).\nIn the context of flight delay prediction, a typical machine learning pipeline\nconsists of:\n1 Data acquisition – gathering historical flight data with columns like\nFlightDate, Airline, ScheduledDepTime, ArrDelay, WeatherDelay, Origin, and\nDestination;\n2 Preprocessing (focus of Laboratory Work 3):\n− cleaning and imputing missing values;\n− converting date/time into numerical features (hour, day of week,\nmonth);\n− encoding categorical features (airlines, airports);\n− scaling numeric variables (e.g., distance, delays);\n3 Exploratory Data Analysis (EDA):\n− analyzing delay distribution over time and across carriers;\n− identifying peak delay times and high-risk airports;\n− visualizing correlations between features and delay status;\n4 Model training and evaluation (also covered in Laboratory Work 3):\n− applying ML algorithms;\n− validating models using accuracy, AUC, and confusion matrix;\n− interpreting feature importance to understand key drivers of delays.\nSummary of Findings from Flight Delay Research:\n− weather and time-of-day are major predictors of delay;\n− flights departing late in the day are more likely to be delayed;\n− airport congestion and holidays introduce high variance;\n− gradient boosting methods often outperform simpler models in this task.\nThis laboratory work will focus on implementing the pipeline using real-world\ndata and comparing various classification models on their ability to predict flight\ndelays.\n\n-- 4 of 19 --\n\n5\nIn applied machine learning tasks such as flight delay prediction, the goal is\nnot only to achieve accurate predictions but also to generate insights that can support\noperational decision-making in real-world systems.\n1.2 Implementation of flight delay prediction pipeline using machine\nlearning\nIn this laboratory work, we will use the “2015 Flight Delays and\nCancellations” dataset from the U.S. Department of Transportation. This dataset\nincludes flight-level records with scheduled and actual departure/arrival times,\ndelays, carriers, airports, distance, and more. Use the flights.csv table from the\ndataset.\nWe aim to build a binary classification model that predicts whether a flight\nwill be delayed by more than 15 minutes upon arrival.\nPart 1: Setting Up the Environment\nStep 1: Create a Virtual Environment\npython -m venv flight_env\nActivate the environment\nflight_env\\Scripts\\activate\nStep 2: Install Required Libraries\npip install pandas numpy scikit-learn matplotlib seaborn\nStep 3: Import the Libraries\nimport pandas as pd\nimport numpy as np\n\n-- 5 of 19 --\n\n6\nimport matplotlib.pyplot as plt\nimport seaborn as sns\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier,\nGradientBoostingClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.svm import SVC\nfrom sklearn.metrics import accuracy_score, classification_report,\nconfusion_matrix\nPart 2: Load and Prepare the Dataset\nStep 1: Load the Dataset\ndf = pd.read_csv("flights.csv", low_memory=False)\ndf.head()\nStep 2: Define the Target Variable\ndf[\'is_delayed\'] = (df[\'ARRIVAL_DELAY\'] > 15).astype(int)\nStep 3: Drop Unnecessary Columns\nWe should remove the \'FLIGHT_NUMBER\' and \'TAIL_NUMBER\' columns,\nas they are unique to each flight and do not help predict delays. Such variables do\nnot contain predictive information and may introduce noise into the model.\nAlso, the \'CANCELLED\' and \'DIVERTED\' columns should be removed, as\nthe model is supposed to predict delays, not cancellations or route changes. These\nfields can confuse the model because a flight can be canceled without delay.\n\n-- 6 of 19 --\n\n7\ndf = df.drop(columns=[\'FLIGHT_NUMBER\', \'TAIL_NUMBER\',\n\'CANCELLED\', \'DIVERTED\'], errors=\'ignore\')\nPart 3: Feature Engineering\nStep 1: Extract Time-Based Features\n# Convert to hour\ndf[\'DepHour\'] = (df[\'SCHEDULED_DEPARTURE\'] // 100).astype(int)\ndf[\'ArrHour\'] = (df[\'SCHEDULED_ARRIVAL\'] // 100).astype(int)\n# Extract day of the week\ndf[\'DayOfWeek\'] = pd.to_datetime(df[[\'YEAR\', \'MONTH\',\n\'DAY\']]).dt.dayofweek\nStep 2: Handle Missing Values\nFlight datasets often contain missing values due to reporting issues or\ncancelled flights. Since the model predicts arrival delay, rows with missing\nARRIVAL_DELAY values are removed.\ndf = df.dropna(subset=[\'ARRIVAL_DELAY\'])\nPart 4: Split the Dataset\nfrom sklearn.model_selection import train_test_split\nX = df.drop(columns=[\'is_delayed\', \'ARRIVAL_DELAY\'])\ny = df[\'is_delayed\']\nX_train, X_test, y_train, y_test = train_test_split(\nX, y, test_size=0.3, random_state=42, stratify=y\n)\nPart 5: Encode Categorical Variables\n\n-- 7 of 19 --\n\n8\ncat_features = [\'AIRLINE\', \'ORIGIN_AIRPORT\',\n\'DESTINATION_AIRPORT\']\nX_train = pd.get_dummies(X_train, columns=cat_features)\nX_test = pd.get_dummies(X_test, columns=cat_features)\n# Align train and test datasets to ensure identical columns\nX_train, X_test = X_train.align(X_test, join=\'left\', axis=1, fill_value=0)\nCategorical variables are encoded after the train–test split to preserve the\ncorrect machine learning workflow. After one-hot encoding, the training and test\ndatasets are aligned to ensure that both contain identical feature columns.\nPart 6: Scale Numerical Features\nscaler = StandardScaler()\nnum_cols = [\'DEPARTURE_DELAY\', \'SCHEDULED_DEPARTURE\',\n\'SCHEDULED_ARRIVAL\']\nX_train[num_cols] = scaler.fit_transform(X_train[num_cols])\nX_test[num_cols] = scaler.transform(X_test[num_cols])\nPart 7: Train and Evaluate Models\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score, confusion_matrix,\nclassification_report\nmodel = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_test)\nprint("Accuracy:", accuracy_score(y_test, y_pred))\nprint(confusion_matrix(y_test, y_pred))\n\n-- 8 of 19 --\n\n9\nprint(classification_report(y_test, y_pred))\n1.3 Some tips related to the flight delay prediction pipeline\nBuilding a reliable flight delay prediction system involves addressing multiple\nchallenges in real-world data handling. Below are practical tips and strategies to\nimprove the effectiveness, robustness, and interpretability of your machine learning\npipeline:\n1 Create a Test Set Before Performing EDA\nIt is crucial to create the train/test split before conducting exploratory data\nanalysis (EDA) to avoid data snooping bias. Insights from EDA can unconsciously\ninfluence model design, leading to overfitting on the evaluation set.\nRecommendation:\nUse stratified sampling to ensure the test set preserves the proportion of\ndelayed vs. non-delayed flights.\nX_train, X_test, y_train, y_test = train_test_split(\nX, y, stratify=y, test_size=0.3, random_state=42)\n2 Handle Missing Values Thoughtfully\nFlight datasets often contain missing values due to sensor failures, reporting\ndelays, or inconsistent data entry.\nTable 1.1 - Approaches\nSituation Recommended Method\nFew missing values (<5%) Drop rows using dropna()\nTime-dependent variables Forward fill (ffill) or backward fill (bfill)\nNumerical variables Fill with mean() or median()\nCategorical variables Fill with mode()\n\n-- 9 of 19 --\n\n10\nEnd of table 1.1\nSituation Recommended Method\nComplex patterns Use KNNImputer or other predictive imputation\nMissing may be meaningful Create indicator variables and fill with extreme\nvalue (e.g., -999)\nExample:\nfrom sklearn.impute import KNNImputer\nimputer = KNNImputer(n_neighbors=5)\nX_train = imputer.fit_transform(X_train)\nX_test = imputer.transform(X_test)\n3 Time Features Need Special Attention\nTime columns such as CRSDepTime (scheduled departure time) are often\nrecorded in HHMM format. These must be transformed carefully:\n− convert to hour (0–23) to capture daily patterns;\n− consider grouping hours (e.g., night, morning, afternoon, evening) for\ncategorical modeling;\n− create weekday/weekend, month, or holiday flag columns.\n4 Be Careful with High-Cardinality Categorical Variables\nAirport codes (e.g., JFK, LAX, ORD) and carriers can have many unique\nvalues. If you use one-hot encoding:\n− apply it after splitting the data, to avoid leaking unseen categories from\nthe test set;\n− align training and testing sets with align():\n− X_train, X_test = X_train.align(X_test, join=\'left\', axis=1,\nfill_value=0)\n5 Normalize Numerical Features for Distance-Based Models\n\n-- 10 of 19 --\n\n11\nIf you are using algorithms sensitive to feature scaling (e.g., SVM, Logistic\nRegression), it is recommended to scale numeric values using StandardScaler or\nMinMaxScaler.\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_train[num_cols] = scaler.fit_transform(X_train[num_cols])\nX_test[num_cols] = scaler.transform(X_test[num_cols])\n6 Evaluate Models with Balanced Metrics\nBecause class imbalance (i.e., more on-time flights than delayed ones) is\ncommon, accuracy alone may not reflect true model quality. Use:\n− confusion matrix for TP, FP, FN, TN;\n− precision, recall, F1-score to assess balance;\n− ROC-AUC for overall separability;\n− KS Statistic to compare probability distributions.\nfrom sklearn.metrics import roc_auc_score\nauc = roc_auc_score(y_test, model.predict_proba(X_test)[:,1])\n7 Interpretability Matters in Transportation\nEven if a complex model performs better, simpler models (e.g., Logistic\nRegression, Decision Trees) offer better transparency, which is often required in the\ntransport industry. Use:\n− feature importance plots;\n− SHAP or LIME for local explanations (optional advanced task);\n− aggregated feature statistics per class.\nBy incorporating these practical strategies, students can ensure their models\nare both technically sound and applicable in real-world scenarios, especially in\noperational contexts such as airline management and delay mitigation systems.\n\n-- 11 of 19 --\n\n12\n1.4 Formatting documents\n1.4.1 Basic formatting standards for lab documents\nThe report is prepared in the text editor MS Word [3]. You need to open the\ntemplate at the link [4] and save the document in .docx format with the appropriate\nname, for example, Report_1_BCSMAI_Ivanov_KN_424.docx. This template is a\nset of styles that should be used when creating reports on laboratory work, this\ntemplate also explains the cases of using one or another style, formatting and design\nof various elements of the report. Before making a report, you should study the\nrequirements for making reports, which are given in the template and below the text.\nIt is considered that the student has basic skills in MS Word (or similar editors,\nsuch as OpenOffice.org Writer).\nDocument formatting refers to the way a document is laid out on the page—\nthe way it looks and is visually organized—and it addresses things like font\nselection, font size and presentation (like bold or italics), spacing, margins,\nalignment, columns, indentation, and lists. Basically, the mechanics of how the\nwords appear on the page. A well formatting document is consistent, correct (in\nterms of meeting any stated requirements), and easy to read [5].\nBasic formatting standards include:\n1 The report is made on sheets of A4 printing paper (297 mm x 210 mm). The\nmargins must be: left, bottom and top - not less than 20 mm, right - not less than 10\nmm.\n2 14 pt. font in a consistent style throughout, including section headings and\nsubsection headings, headers, footers, and visual labels. Font of notes, text elements\nin table can be 12 pt.\n3 A standard, professional font is Times New Roman.\n4 1.5 line spacing, with 1.25 indentation on the first line of the paragraph\n5 Body text text is aligned with both margins\n6 Page numbers at upper right corner (Arabic numerals). The number is not\n\n-- 12 of 19 --\n\n13\nplaced on the title page, which is the first page of the document, but it is\nincluded in the general numbering (a sample of the title page for the report on\nlaboratory work is given in Appendix A).\nDocuments usually have some form of “logical structure”: division into\nchapters, sections, sub-sections etc. to organize its content. Each element of structure\nhas corresponding heading, and heading of each part of document has own formtting\nstandards:\n7 Heading of Section. New section begins with a new page (page break at the\nend of the previous part of the text). Formatting of heading of section: Times New\nRoman 14 pt., bold, Capital, center text, 1.5 line spacing, after heading 21 points.\n8 Heading of Subsection is separated from the text body by blank line.\nFormatting of heading of subsection: Times New Roman 14 pt., bold, justified text,\n1.25 indentation.\n9 Heading of Item is NOT separated by line from the text body. Formatting of\nheading of item:Times New Roman 14 pt., bold, justified text, 1.25 indentation.\nTo automatically generate table of contents, you must first configure the styles\nof elements of structure.\n\n-- 13 of 19 --\n\n14\n2 TASKS OF LABORATORY WORK\n2.1 The purpose of this practical work\nThis laboratory work challenges students to design and evaluate a machine\nlearning system that predicts flight delays using real-world aviation data. Unlike\nconventional predictive tasks, this lab emphasizes:\n− interpretability of results for operational decision-making;\n− contextual analysis of features like time of day, airport traffic, and\nweather impact;\n− comparative model diagnostics including model stability and fairness;\n− development of insights into flight planning, optimization, and\npassenger experience.\nThrough this work, students will gain experience in:\n− transforming complex temporal and categorical features;\n− handling imbalanced and noisy real-world data;\n− evaluating models in terms of not just accuracy but operational value;\n− visual storytelling with data through intuitive plots and aggregated\ncomparisons;\n− designing practical recommendations based on predictive results.\nThis task simulates a data scientist role in a transportation company, providing\nboth technical and business value.\n2.2 Stages of laboratory work\nStudents may complete the laboratory work using the provided flight delay\ndataset or apply the same machine learning workflow to a dataset related to their\nmaster’s thesis or research topic. In this case, the student must clearly formulate the\nprediction or analysis task and follow the same stages of exploratory data analysis,\nfeature engineering, model training, evaluation, and interpretation described in this\nlaboratory work.\n\n-- 14 of 19 --\n\n15\nThe lab is structured in 6 main stages, each encouraging critical thinking and\ndata-driven reasoning:\nStage 1: Build a Delay Classifier\n− load and clean the dataset.\n− engineer at least three time-related features and encode at least two\ncategorical variables.\n− create binary target: is_delayed (1 if arrival delay > 15 minutes).\n− prepare train/test split with stratification.\nDeliverable: Cleaned DataFrame with selected features + test set snapshot.\nStage 2: Visual Flight Intelligence Dashboard (EDA)\nUse visualizations to answer the following questions:\n− which days of the week have the most delays?\n− are delays more common in the morning, afternoon or evening?\n− which airports or routes are most problematic?\n− are certain carriers more prone to delays?\nRecommended tools: Seaborn, groupby(), pivot_table(), heatmaps, and\nviolin/box plots.\nDeliverable: At least 4 meaningful visualizations + brief interpretations for\neach.\nStage 3: Train, Compare, and Analyze Models\n− train at least three models (e.g., Logistic Regression, Random Forest,\nGradient Boosting).\n− use Accuracy, AUC, F1-score, confusion matrix for evaluation.\n− plot feature importance and discuss which variables matter most.\n− optionally test a threshold shift: what happens if we define delay as >\n30 min?\nDeliverable: Metrics comparison table summarizing model performance (e.g.,\nAccuracy, F1-score, AUC), model comparison discussion, and feature importance\ngraph.\nStage 4: Decision Support and Operational Recommendations\n\n-- 15 of 19 --\n\n16\nImagine you work as a data analyst responsible for supporting decision-\nmaking in the selected application domain. Based on your analysis and model\nresults:\n− what patterns or relationships have you discovered in the data?\n− which factors most strongly influence the target outcome?\n− what practical or operational recommendations could improve the\nsystem or process being analyzed?\n− which cases or situations appear most “at-risk” according to the model\npredictions?\nDeliverable: Short written case summary (0.5–1 page) with bullet-pointed,\ndata-driven recommendations.\nStage 5: Report creating\nAfter completing this laboratory work, students should prepare a report that\nincludes the following sections:\n1) objective – a brief description of the purpose of this work;\n2) main steps – a summary of the key steps performed;\n3) results – key findings from the data analysis;\n4) screenshots – if necessary, students should provide screenshots of key\noutputs;\n5) knowledge and skills acquired – a reflection on what was learned and\nhow these skills can be applied to real-world data analysis tasks.\nThis structured report will ensure a comprehensive understanding of the\npractical work and enhance documentation skills.\nStage 6: Defending\nDefend laboratory work individually: present results; answer questions related\nto the topic or the laboratory work.\n\n-- 16 of 19 --\n\n17\nREFERENCES\n1 Website to finding datasets https://www.kaggle.com.\n2 2015 Flight Delays and Cancellations dataset.\nhttps://www.kaggle.com/datasets/usdot/flight-delays\n3 Microsoft Support // https://support.microsoft.com/en-us/word?ui=en\nus&rs=en-us&ad=us, 09.03.2026\n4 Templates for reports on laboratory work //\nhttps://iiiii.sharepoint.com/:f:/s/Profs.PIITU/ErRwourAhj1AjM3szMwHEsgBcqyrl\n0_Ik8_xHIJp2A-lLQ?e=8nfxUH, 01.03.2026\n5 Chapter 8. Formatting Documents\nhttps://ohiostate.pressbooks.pub/feptechcomm/chapter/8-formatting/, 09.03.2026\n\n-- 17 of 19 --\n\n18\nAPPENDIX A\nSample of design of the title page\nMINISTRY OF EDUCATION AND SCIENCE OF UKRAINE\nNATIONAL TECHNICAL UNIVERSITY\n“KHARKIV POLYTECHNICAL INSTITUTE”\nInstitute (faculty) of Computer Sciences and Software Engineering\nDepartment of Software Engineering and Management Information Technology\nProgram Subject Area 121 Software engineering\nEducational Software engineering __________\nSpecialization _________________________________________________\nLABORATORY WORK №4 on course\n«Machine learning methods»\nLaboratory work subject Applied Machine Learning Workflow: Case Study and\nPractical Implementation\nExecuted by student 1 year, group KN- N225\nPavel ZHERZHERUNOV\n(signature, surname and name)\nChecked by Oksana IVASHCHENKO\n(signature, surname and name)\nKharkiv 2026\n\n-- 18 of 19 --\n\n19\nMINISTRY OF EDUCATION AND SCIENCE OF UKRAINE\nNATIONAL TECHNICAL UNIVERSITY\n“KHARKIV POLYTECHNICAL INSTITUTE”\nInstitute (faculty) of Computer Sciences and Software Engineering\nDepartment of Software Engineering and Management Information Technology\nProgram Subject Area 122 Computer science\nEducational Computer science and intelligent systems __________\nSpecialization _________________________________________________\nLABORATORY WORK №4 on course\n«Machine learning methods»\nLaboratory work subject Applied Machine Learning Workflow: Case Study and\nPractical Implementation\nExecuted by student 1 year, group KN- N425\nPavel ZHERZHERUNOV\n(signature, surname and name)\nChecked by Oksana IVASHCHENKO\n(signature, surname and name)\nKharkiv 2026\n\n-- 19 of 19 --\n\n',
    'Problem Management. Manages the life cycle of incidents and problems. Identifies and resolves the root cause of incidents. Takes a proactive approach to avoidance or identification of root cause of ICT problems. Deploys a knowledge system based on recurrence of common errors. Resolves or escalates incidents. Optimises system or component performance.',
    'Problem Management. Manages the life cycle of incidents and problems. Identifies and resolves the root cause of incidents. Takes a proactive approach to avoidance or identification of root cause of ICT problems. Deploys a knowledge system based on recurrence of common errors. Resolves or escalates incidents. Optimises system or component performance.',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 384]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities)
# tensor([[ 1.0000, -0.2074, -0.2074],
#         [-0.2074,  1.0000,  1.0000],
#         [-0.2074,  1.0000,  1.0000]])
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
  | sentence_0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | sentence_1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | sentence_2                                                                                                                                                                                                                                                                                                                                                                    |
  |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE<br>NATIONAL TECHNICAL UNIVERSITY<br>“KHARKIV POLYTECHNICAL INSTITUTE”<br>LABORATORY WORK №4<br>“Applied Machine Learning Workflow: Case Study and Practical<br>Implementation”<br>on course «Machine learning methods»<br>Kharkiv 2026<br><br>-- 1 of 19 --<br><br>2<br>CONTENT<br>1 Theoretic work material ............................................................................... 3<br>1.1 Theoretical background: flight delay prediction ................................... 3<br>1.2 Implementation of flight delay prediction pipeline using machine<br>learning ................................................................................................................... 5<br>1.3 Some tips related to the flight delay prediction pipeline ....................... 9<br>1.4 Formatting documents ......................................................................... 12<br>1.4.1 Basic formatting standards for lab documents .............................. 12<br>2 Tasks of laboratory work ..........................</code>                                                                   | <code>Problem Management. Manages the life cycle of incidents and problems. Identifies and resolves the root cause of incidents. Takes a proactive approach to avoidance or identification of root cause of ICT problems. Deploys a knowledge system based on recurrence of common errors. Resolves or escalates incidents. Optimises system or component performance.</code>                                                                                                                                                      | <code>Problem Management. Manages the life cycle of incidents and problems. Identifies and resolves the root cause of incidents. Takes a proactive approach to avoidance or identification of root cause of ICT problems. Deploys a knowledge system based on recurrence of common errors. Resolves or escalates incidents. Optimises system or component performance.</code> |
  | <code><br><br>MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE <br>NATIONAL TECHNICAL UNIVERSITY  <br>“KHARKIV POLYTECHNICAL INSTITUTE” <br> <br> <br> <br> <br> <br> <br> <br>LABORATORY WORK No4  <br>“Applied Machine Learning Workflow: Case Study and Practical <br>Implementation”  <br> <br>on course «Machine learning methods» <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br>Kharkiv 2026 <br><br>2 <br> <br>CONTENT <br>1 Theoretic work material ............................................................................... 3 <br>1.1 Theoretical background: flight delay prediction ................................... 3 <br>1.2  Implementation  of  flight  delay  prediction  pipeline  using  machine <br>learning ................................................................................................................... 5 <br>1.3 Some tips related to the flight delay prediction pipeline ....................... 9 <br>1.4 Formatting documents ......................................................................... 12 <br>1.4.1 Basic formatting standards for lab documents ..........................</code> | <code>Problem Management. Manages the life cycle of incidents and problems. Identifies and resolves the root cause of incidents. Takes a proactive approach to avoidance or identification of root cause of ICT problems. Deploys a knowledge system based on recurrence of common errors. Resolves or escalates incidents. Optimises system or component performance.</code>                                                                                                                                                      | <code>Problem Management. Manages the life cycle of incidents and problems. Identifies and resolves the root cause of incidents. Takes a proactive approach to avoidance or identification of root cause of ICT problems. Deploys a knowledge system based on recurrence of common errors. Resolves or escalates incidents. Optimises system or component performance.</code> |
  | <code><br><br>MINISTRY OF EDUCATION AND SCIENCE OF UKRAINE <br>NATIONAL TECHNICAL UNIVERSITY  <br>“KHARKIV POLYTECHNICAL INSTITUTE” <br> <br> <br> <br> <br> <br> <br> <br>LABORATORY WORK No4  <br>“Applied Machine Learning Workflow: Case Study and Practical <br>Implementation”  <br> <br>on course «Machine learning methods» <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br> <br>Kharkiv 2026 <br><br>2 <br> <br>CONTENT <br>1 Theoretic work material ............................................................................... 3 <br>1.1 Theoretical background: flight delay prediction ................................... 3 <br>1.2  Implementation  of  flight  delay  prediction  pipeline  using  machine <br>learning ................................................................................................................... 5 <br>1.3 Some tips related to the flight delay prediction pipeline ....................... 9 <br>1.4 Formatting documents ......................................................................... 12 <br>1.4.1 Basic formatting standards for lab documents ..........................</code> | <code>Service Delivery. Ensures service delivery in accordance with established service level agreements (SLA's). Takes proactive action to ensure stable and secure applications and ICT infrastructure to avoid potential service disruptions, attending to capacity planning and to information security. Updates operational document library and logs all service incidents. Maintains monitoring and management tools (i.e. scripts, procedures). Maintains IS services. Manages all aspects of service availability.</code> | <code>Problem Management. Manages the life cycle of incidents and problems. Identifies and resolves the root cause of incidents. Takes a proactive approach to avoidance or identification of root cause of ICT problems. Deploys a knowledge system based on recurrence of common errors. Resolves or escalates incidents. Optimises system or component performance.</code> |
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
- **Training**: 47.8 seconds

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