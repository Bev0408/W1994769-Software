"""
Synthetic Data Generator for NLP Risk Profiler
Generates 500 balanced rows of financial goal statements
Based on ONS UK saving habits demographics
"""

import pandas as pd
import random
import os

# Seed for reproducibility
random.seed(42)

# Template phrases for each risk profile
CONSERVATIVE_TEMPLATES = [
    "I want to protect my savings and avoid any losses. Safety is my priority.",
    "I'm nearing retirement and need stable income with minimal risk.",
    "I prefer low-risk investments that preserve my capital.",
    "I'm saving for a house deposit in the next year and can't afford to lose money.",
    "I want guaranteed returns even if they're small. I hate volatility.",
    "My emergency fund needs to be safe and accessible.",
    "I'm risk-averse and prefer bonds over stocks any day.",
    "Capital preservation is more important to me than growth.",
    "I want steady, predictable returns without any surprises.",
    "I'm close to retiring so I need stable investments that won't fluctuate.",
    "I don't want to take any chances with my savings.",
    "Low returns are fine as long as my money is safe.",
    "I'm saving for something in the next 2 years so I need certainty.",
    "I get anxious when markets are volatile so I stick to safe options.",
    "Government bonds and savings accounts suit my needs perfectly.",
    "I'm over 60 and need to protect what I've earned.",
    "Stability and security are my top priorities for investments.",
    "I would rather miss out on gains than risk losing my capital.",
    "Fixed income investments are what I'm looking for.",
    "I want something as safe as a bank account but maybe slightly better returns."
]

BALANCED_TEMPLATES = [
    "I want a mix of growth and stability for my long-term savings.",
    "I'm comfortable with some ups and downs if it means better returns overall.",
    "I'm saving for my children's university fees in about 10 years.",
    "I can handle moderate risk if the long-term outlook is positive.",
    "A balanced portfolio of stocks and bonds would suit me well.",
    "I want steady growth over time but not too much volatility.",
    "I'm in my 40s and want to grow my pension without going too aggressive.",
    "Some risk is acceptable but I don't want wild swings in my portfolio.",
    "I'd like a diversified mix that balances growth with security.",
    "I'm looking for consistent returns over a 5-10 year horizon.",
    "Middle of the road investments work best for my situation.",
    "I want reasonable growth potential while managing downside risk.",
    "Not too conservative, not too aggressive - somewhere in between.",
    "I can tolerate short-term losses for medium-term gains.",
    "A 50/50 split between stocks and bonds sounds about right.",
    "I'm building a nest egg and have 10-15 years until I need it.",
    "Moderate risk is fine as I have time to recover from any dips.",
    "I want diversification across different asset classes.",
    "Growth is important but so is some level of stability.",
    "I'm looking for the sweet spot between risk and reward."
]

AGGRESSIVE_TEMPLATES = [
    "I want maximum growth and I'm happy to ride out any volatility.",
    "I'm young and have decades before retirement, so I can take big risks.",
    "I want high-growth stocks and emerging markets exposure.",
    "I'm excited about cryptocurrency and tech startups.",
    "I don't mind if my portfolio goes down 30% as long as the long-term returns are high.",
    "I want aggressive growth even if it means significant short-term losses.",
    "This is play money I can afford to lose, so go for maximum returns.",
    "I'm in my 20s with a high income and want to grow wealth rapidly.",
    "All-in on equities, no bonds needed. I want growth.",
    "I'm comfortable with high volatility for potentially high rewards.",
    "I want exposure to disruptive technologies and growth stocks.",
    "Risk doesn't scare me, I see it as opportunity.",
    "My time horizon is 30+ years so I can handle any crashes.",
    "I'm looking for aggressive capital appreciation strategies.",
    "Bitcoin, tech stocks, and venture capital interest me.",
    "I want the highest possible returns and accept the associated risks.",
    "I have a high risk tolerance and want my money working hard.",
    "Growth-focused investments are what I'm after.",
    "I'm speculating with money I can afford to lose completely.",
    "Maximum risk, maximum reward - that's my approach."
]

# Modifiers to add variety
PREFIXES = [
    "", "Honestly, ", "To be frank, ", "Looking at my situation, ",
    "At this stage in life, ", "Given my circumstances, ", "For my financial goals, ",
    "When it comes to investing, ", "My philosophy is that ", "I believe ",
]

SUFFIXES = [
    "", " What do you recommend?", " That's my view on things.",
    " I hope that makes sense.", " Does that help?", " That's how I feel about it.",
    " I'd appreciate your advice.", " Let me know your thoughts.", "",
]


def generate_sample(templates: list, label: str) -> dict:
    """Generate a single sample with optional modifications."""
    base = random.choice(templates)
    prefix = random.choice(PREFIXES)
    suffix = random.choice(SUFFIXES)
    
    text = f"{prefix}{base}{suffix}".strip()
    return {"text": text, "risk_profile": label}


def generate_dataset(total_samples: int = 500) -> pd.DataFrame:
    """Generate a balanced dataset with equal samples per class."""
    samples_per_class = total_samples // 3
    remainder = total_samples % 3
    
    data = []
    
    # Generate samples for each class
    for _ in range(samples_per_class):
        data.append(generate_sample(CONSERVATIVE_TEMPLATES, "Conservative"))
        data.append(generate_sample(BALANCED_TEMPLATES, "Balanced"))
        data.append(generate_sample(AGGRESSIVE_TEMPLATES, "Aggressive"))
    
    # Handle remainder to hit exact total
    labels = ["Conservative", "Balanced", "Aggressive"]
    templates_map = {
        "Conservative": CONSERVATIVE_TEMPLATES,
        "Balanced": BALANCED_TEMPLATES,
        "Aggressive": AGGRESSIVE_TEMPLATES
    }
    for i in range(remainder):
        label = labels[i]
        data.append(generate_sample(templates_map[label], label))
    
    # Shuffle the data
    random.shuffle(data)
    
    return pd.DataFrame(data)


def main():
    # Ensure output directory exists
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "..", "data")
    os.makedirs(data_dir, exist_ok=True)
    
    output_path = os.path.join(data_dir, "training_data.csv")
    
    # Generate dataset
    print("Generating synthetic training data...")
    df = generate_dataset(500)
    
    # Save to CSV
    df.to_csv(output_path, index=False)
    
    # Print summary
    print(f"\n✓ Generated {len(df)} samples")
    print(f"✓ Saved to: {output_path}")
    print("\nClass distribution:")
    print(df["risk_profile"].value_counts())


if __name__ == "__main__":
    main()
