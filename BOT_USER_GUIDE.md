# 🤖 Telegram Bot Quick Reference Guide

## Getting Started

### Find the Bot
- **Telegram Username:** `@drug_toxicity_detector_bot`
- **Search in Telegram:** Look for "drug_toxicity_detector_bot"
- **Direct Link:** Click the "Try Bot" button on the web app

### First Steps
1. Open the bot chat
2. Type `/start` to see welcome message
3. Read the instructions
4. Send a SMILES string to analyze

---

## How to Use

### Step 1: Get a SMILES String
SMILES (Simplified Molecular Input Line Entry System) is a text notation for chemical structures.

**Where to find SMILES:**
- **PubChem:** https://pubchem.ncbi.nlm.nih.gov/
- **ChemSpider:** https://www.chemspider.com/
- **NCBI Structure:** https://www.ncbi.nlm.nih.gov/structure/

**Search Example:**
1. Go to PubChem
2. Search "Aspirin"
3. Copy the SMILES string: `CC(=O)Oc1ccccc1C(=O)O`

### Step 2: Send to Bot
Simply copy-paste the SMILES string and send to the bot:

```
Send: CC(=O)Oc1ccccc1C(=O)O
```

### Step 3: Get Predictions
The bot will analyze the compound and return:
- ✅ Toxicity scores for 12 biological targets
- 🧬 Molecular features (weight, polarity, etc.)
- 📊 Risk level assessment
- 📈 Overall toxicity percentage

---

## Available Commands

### `/start`
Shows welcome message with:
- What the bot does
- How to use it
- Example SMILES strings
- Tox21 targets being analyzed

### `/help`
Provides detailed information:
- What is SMILES?
- Where to get SMILES strings
- Examples of common compounds
- Information about Tox21 targets
- Supported formats

---

## Example Compounds

Try these SMILES with the bot:

| Compound | SMILES | Category |
|----------|--------|----------|
| Aspirin | `CC(=O)Oc1ccccc1C(=O)O` | Drug |
| Caffeine | `CN1C=NC2=C1C(=O)N(C(=O)N2C)C` | Drug |
| Ethanol | `CCO` | Simple |
| Benzene | `c1ccccc1` | Aromatic |
| Glucose | `C([C@@H]1[C@H]([C@@H]([C@H](O1)O)O)O)O` | Complex |

---

## Understanding Results

### Toxicity Prediction (%)
- **0-20%:** Low risk (🟢)
- **20-50%:** Medium risk (🟡)
- **50-70%:** High risk (🟠)
- **70-100%:** Critical risk (🔴)

### What are the 12 Targets?

**Nuclear Receptors (NR)** - Hormone systems:
1. **AR** - Androgen Receptor (male hormones)
2. **AR-LBD** - Androgen Receptor Binding Site
3. **AhR** - Aryl Hydrocarbon Receptor (environmental toxins)
4. **Aromatase** - Estrogen synthesis enzyme
5. **ER** - Estrogen Receptor (female hormones)
6. **ER-LBD** - Estrogen Receptor Binding Site
7. **PPAR-gamma** - Metabolic receptor

**Stress Response (SR)** - Cell damage indicators:
8. **ARE** - Antioxidant Response (oxidative stress)
9. **ATAD5** - DNA damage response
10. **HSE** - Heat Shock (protein stress)
11. **MMP** - Mitochondrial health
12. **p53** - Tumor suppressor (DNA damage)

### Molecular Features Explained

- **MolWt** (Molecular Weight): Larger molecules may have different bioavailability
- **LogP** (Octanol-Water Partition): How well the compound crosses membranes
- **TPSA** (Polar Surface Area): Affects ability to pass through barriers
- **H-Bond Donors/Acceptors**: Important for binding to proteins
- **Rotatable Bonds**: Flexibility of the molecule
- **Ring Count**: Structural rigidity
- **Aromatic Rings**: Chemical stability and activity

---

## Tips for Best Results

### ✅ Do's
- ✓ Use valid SMILES notation
- ✓ Copy SMILES exactly from sources
- ✓ Try multiple compounds
- ✓ Use `/help` if confused
- ✓ Ask for specific compound names - bot can help
- ✓ Check for spelling in SMILES

### ❌ Don'ts
- ✗ Don't invent SMILES strings
- ✗ Don't include spaces or line breaks
- ✗ Don't send multiple SMILES on one line
- ✗ Don't expect pharmaceutical advice (research only!)
- ✗ Don't use this for critical medical decisions

---

## Error Messages & Solutions

### ❌ "Invalid SMILES String"
**Causes:**
- Typo in the SMILES string
- Mismatched brackets `[]` or parentheses `()`
- Missing elements

**Solution:**
1. Copy SMILES again from reliable source
2. Check for typos
3. Try `/help` for examples
4. Ask bot for help: "What is SMILES for aspirin?"

### ❌ "Invalid input format"
**Causes:**
- Not sending a SMILES string
- Sending only text description
- Sending a compound name instead of SMILES

**Solution:**
1. Find SMILES notation first
2. Use PubChem to search for compound name
3. Copy exact SMILES string

### ❌ Server Error
**Causes:**
- Temporary server issue
- Very long/complex SMILES
- Network connectivity

**Solution:**
1. Try again in a few seconds
2. Try a simpler SMILES first
3. Check your internet connection

---

## Getting SMILES from Bot

You can message the bot with a compound name and it will help guide you to find the SMILES:

**You:** "What's aspirin?" (or just ask for help)  
**Bot:** Points you to resources to find SMILES

---

## Educational Resources

### Learn More About:
- **SMILES:** https://www.daylight.com/dayhtml/doc/theory/theory.smiles.html
- **Tox21:** https://tox21.epa.gov/
- **PubChem:** https://pubchem.ncbi.nlm.nih.gov/help/

### Related Tools:
- **Online SMILES Viewer:** https://jmol.sourceforge.net/
- **Molecular Calculator:** https://www.chemcalc.org/
- **RDKit Playground:** https://www.rdkit.org/

---

## FAQ

**Q: Can I analyze real drugs?**  
A: Yes! But this is for research/education. Always consult experts for real pharmaceutical decisions.

**Q: Why does my SMILES fail?**  
A: Check for typos or use the exact SMILES from PubChem/ChemSpider.

**Q: How accurate are predictions?**  
A: ~80% accurate. Use for screening, not final decisions.

**Q: Can I use this commercially?**  
A: This is for research/educational purposes only.

**Q: How fast are results?**  
A: Usually within 2-3 seconds from sending SMILES.

**Q: Who made this?**  
A: Built with machine learning and Tox21 data. See main documentation.

---

## Web App Alternative

For more detailed analysis with molecular visualization:
1. Visit: https://drug-toxicity-prediction.onrender.com
2. Enter SMILES string
3. View 3D molecular structure
4. See all 12 targets with interactive results

---

## Need Help?

1. **In Bot:** Type `/help` or `/start`
2. **Web App:** Visit the main website
3. **Documentation:** Check TELEGRAM_BOT_SETUP.md
4. **Questions:** Review this guide

---

**Happy toxicity analyzing! 🧪**

*Remember: This tool is for research and education. Always consult domain experts for critical decisions.*
