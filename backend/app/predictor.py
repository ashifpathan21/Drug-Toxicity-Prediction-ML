from app.model_loader import models, scaler
from app.config import THRESHOLDS
import numpy as np
import pandas as pd  # Imported to handle feature names for the scaler
from rdkit import Chem
from rdkit.Chem import Descriptors
from rdkit.Chem import MACCSkeys
from rdkit import DataStructs
from rdkit.Chem.rdFingerprintGenerator import GetMorganGenerator

# Morgan fingerprint generator
morgan_generator = GetMorganGenerator(radius=2, fpSize=2048)

# Selected descriptors
selected_descriptors = [
    Descriptors.MolWt,
    Descriptors.MolLogP,
    Descriptors.TPSA,
    Descriptors.NumHAcceptors,
    Descriptors.NumHDonors,
    Descriptors.NumRotatableBonds,
    Descriptors.RingCount,
    Descriptors.NumAromaticRings,
    Descriptors.HeavyAtomCount,
    Descriptors.FractionCSP3,
    Descriptors.BalabanJ,
    Descriptors.BertzCT
]

# Descriptor names required by your fitted StandardScaler
descriptor_names = [
    'MolWt',
    'MolLogP',
    'TPSA',
    'NumHAcceptors',
    'NumHDonors',
    'NumRotatableBonds',
    'RingCount',
    'NumAromaticRings',
    'HeavyAtomCount',
    'FractionCSP3',
    'BalabanJ',
    'BertzCT'
]

def extract_features(smiles):

    mol = Chem.MolFromSmiles(smiles)

    if mol is None:
        return None

    # ----------------
    # descriptors
    # ----------------
    desc = []
    for d in selected_descriptors:
        try:
            desc.append(d(mol))
        except:
            desc.append(0.0)

    desc = np.array(desc)

    # ----------------
    # Morgan fingerprint
    # ----------------
    fp = morgan_generator.GetFingerprint(mol)

    morgan = np.zeros((2048,))
    DataStructs.ConvertToNumpyArray(fp, morgan)

    # ----------------
    # MACCS keys
    # ----------------
    maccs = MACCSkeys.GenMACCSKeys(mol)

    maccs_array = np.zeros((167,))
    DataStructs.ConvertToNumpyArray(maccs, maccs_array)

    # ----------------
    # combine
    # ----------------
    features = np.concatenate([desc, morgan, maccs_array])

    # remove nan/inf
    features = np.nan_to_num(features)

    return features.reshape(1, -1)   # important


def predict(smiles):

    X = extract_features(smiles)
    mol_details = list(X[0][:12])
    print(mol_details)
    if X is None:
        return None

    # ----------------
    # Standard Scaling
    # ----------------
    X_desc_df = pd.DataFrame(X[:, :12], columns=descriptor_names)
    X[:, :12] = scaler.transform(X_desc_df)

    results = {}
    max_prob = 0.0

    for target, model in models.items():
        prob = []
        for m in model:
            # Extract probability and aggressively cast to native Python float
            raw_prob = m.predict_proba(X)[0][1]
            prob.append(float(np.asarray(raw_prob).item())) 

        # Cast the dictionary key to a standard Python string 
        # (This is the most likely cause of your current crash)
        safe_target_key = str(target)

        # Ensure threshold is a standard float
        threshold = float(THRESHOLDS.get(target, 0.5))
        prob = float(np.mean(prob))
        # Ensure verdict is a standard boolean
        verdict = bool(prob >= threshold)

        results[safe_target_key] = {
            "predict_prob": f'{prob:.2f}',
            "threshold": threshold,
            "toxic": verdict
        }

        if prob > max_prob:
            max_prob = prob

    tox_prob = models['toxic'][0].predict_proba(X)[0][1]
    max_prob=(max_prob+tox_prob)/2
    final_verdict = bool(max_prob >= 0.5)

    return {
        "names":descriptor_names,
        "info":mol_details,
        "targets": results,
        "max_prob": f'{max_prob:.2f}',
        "final_toxic_verdict": final_verdict
    }