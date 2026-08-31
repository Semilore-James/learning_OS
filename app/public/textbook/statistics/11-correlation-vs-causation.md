# Correlation vs causation

## The one-sentence version

Correlation says two things move together; causation says changing one changes the other, and the entire value of an analyst is in not mixing them up in the recommendation.

## What it is

- **Correlation** — a measured association. When X is high, Y tends to be high (positive) or low (negative). Quantified by the **correlation coefficient r**, from -1 to +1, where 0 is no linear relationship.
- **Causation** — a mechanism. Intervening on X produces a change in Y. This is what a decision-maker actually wants, because decisions are interventions.

Every causal relationship shows up as a correlation. Most correlations are not causal.

## Why it exists

Data hands you correlations for free. `df.corr()` produces a whole matrix of them in one line. The temptation is to read a strong correlation as "so if we increase X, Y will follow". Sometimes true, often catastrophically wrong, and the failure is invisible until someone acts on it and nothing happens (or the opposite happens).

## How it works

**Why a correlation between X and Y can appear without X causing Y:**

- **Reverse causation.** Y causes X, not the other way. "Customers who contact support churn more" might mean support contact causes churn, or it might mean customers about to churn contact support first.
- **Confounding.** A third variable Z drives both. Ice cream sales correlate with drownings; summer heat drives both. In analytics: "users of feature A retain better" often just means engaged users both use feature A and retain, and engagement is the confounder.
- **Selection effect.** The way the data was gathered links them. Among hired candidates, interview score and job performance can correlate negatively, because the ones with low interview scores who got hired anyway had some other strong signal.
- **Coincidence.** With enough variables, some will correlate by chance. Test 100 features against an outcome at p < 0.05 and expect about 5 false hits.

**How to move from correlation toward causation:**

1. **A randomised experiment.** Randomly assign who gets X. Randomisation breaks the link to every confounder, known and unknown. This is why A/B tests are the gold standard.
2. **A natural experiment.** Something outside anyone's control changed X for some units and not others (a pricing change that rolled out by region, a bug that disabled a feature for some users). Compare the groups.
3. **Controlling for confounders.** Include the suspected confounder in a regression, or compare within strata (compare feature-A users and non-users at the same engagement level). Only as good as your list of confounders, which is never complete.
4. **A plausible mechanism plus dose-response.** If more X consistently gives more Y, and there is a believable story for how, the causal case strengthens. Still weaker than an experiment.

**The honest hedge:** "X and Y are correlated (r = 0.6). We have not established that X causes Y; engagement is a likely confounder. To find out, we would need to [experiment / natural experiment]." That sentence has saved more roadmaps than any dashboard.

## When you use it

Every time an analysis produces a relationship and someone in the room starts a sentence with "so we should...". Your job at that moment is to say what kind of evidence you have and what it would take to get the kind they are assuming.

## A worked example

An analysis finds that customers who use the mobile app have 30% lower churn than web-only customers. The proposed action: push everyone to install the app.

Before recommending that, ask what else differs between app users and web-only users. App users are disproportionately: newer-generation, higher-plan, more frequent buyers, more engaged overall. Engagement is an obvious confounder, and it plausibly causes both app installation and retention.

Test it: compare churn for app users and web-only users **within the same engagement decile**. If the 30% gap shrinks to 5% once you control for engagement, the app is mostly a marker of engaged customers, not a cause of retention, and a forced-install campaign will not move churn.

The clean answer needs an experiment: prompt a random half of web-only users to install, leave the other half alone, compare churn after 90 days. Until then, the recommendation is "investigate", not "roll out".

> **Try This**
> Find a correlation in a case dataset. Write down one confounder that could produce it without a causal link, and one thing you could check in the data to make the confounder more or less likely. Then play Chart Critiquer, where several rounds hang on exactly this distinction.
