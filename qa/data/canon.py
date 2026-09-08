# -*- coding: utf-8 -*-
"""Buyer / supplier canonicalisation for the company-based event dataset."""
import re

# ---- supplier canonicalisation -------------------------------------------
SUPPLIER = {
    'Polaris': 'Spectralx',                       # Spectralx Ltd., formerly Polaris Solutions (same Israeli company, same two IDF events)
    'Advanced Material Development (AMD)': 'Advanced Material Development',
    'Aselsan A.S.': 'Aselsan',
    'Sioen Industries NV': 'Sioen Industries',
    'Tdu Savunma Sistemleri': 'TDU Savunma',
}

# ---- buyer canonicalisation ----------------------------------------------
# (regex on the raw buyer string, canonical name, country, reason)
RULES = [
 (r'special operations command|USSOCOM|SOCPAC|AFSOC|MARSOC|SOCNORTH', 'U.S. Special Operations Command', 'United States', 'command and its component sub-labels are one contracting body'),
 (r'NAVSUP|Naval Supply Systems Command', 'NAVSUP Weapon Systems Support', 'United States', 'abbreviation, site and full-name variants of one contracting body'),
 (r'NSWC Dahlgren', 'NSWC Dahlgren Division', 'United States', 'NAVSEA warfare-centre naming variants'),
 (r'NUWC Newport', 'NUWC Newport Division', 'United States', 'naming variant'),
 (r'NIWC Atlantic', 'NIWC Atlantic', 'United States', ''),
 (r'Office of Naval Research|Naval Research Laboratory', 'Office of Naval Research / NRL', 'United States', 'ONR and its laboratory recorded as one funding body'),
 (r'Naval Sea Systems Command|NAVSEA', 'NAVSEA', 'United States', 'naming variants'),
 (r'Huntington Ingalls', 'Huntington Ingalls (prime)', 'United States', 'prime contractor, not a government buyer'),
 (r'Air Force Test Center|412th Test Wing', 'U.S. Air Force Test Center', 'United States', 'test-centre and wing naming variants'),
 (r'Pacific Air Forces', 'U.S. Air Force PACAF', 'United States', ''),
 (r'Moody AFB', 'U.S. Air Force Moody AFB', 'United States', ''),
 (r'PEO Combat Support|PEO CS&CSS|PEO CSCSS', 'U.S. Army PEO CS&CSS', 'United States', 'full name vs abbreviation'),
 (r'PEO C3T', 'U.S. Army PEO C3T', 'United States', 'with and without the contracting office suffix'),
 (r'ACC[- ]APG|ACC Warren|Contracting Command', 'U.S. Army Contracting Command', 'United States', 'ACC sites recorded as one contracting command'),
 (r'Rock Island Arsenal', 'U.S. Army Rock Island Arsenal', 'United States', ''),
 (r'TACOM', 'U.S. Army TACOM', 'United States', ''),
 (r'Natick', 'U.S. Army Natick', 'United States', ''),
 (r'ERDC-CRREL', 'U.S. Army ERDC-CRREL', 'United States', ''),
 (r'DEVCOM|Futures Command|Combat Capabilities Development', 'U.S. Army Futures Command / DEVCOM', 'United States', 'AFC and DEVCOM naming variants'),
 (r'Maneuver Support Battle Lab', 'U.S. Army Futures Command / DEVCOM', 'United States', 'AFC laboratory'),
 (r'Secretary of Defense', 'OSD (Foreign Comparative Testing)', 'United States', 'OSD FCT with and without the Army co-label'),
 (r'FEDSIM|ManTech', 'GSA FEDSIM', 'United States', 'contracting agent named in the award'),
 (r'DLA Troop Support|Atlantic Diving', 'DLA Troop Support', 'United States', ''),
 (r'DLA Land and Maritime|Defense Logistics Agency Land', 'DLA Land and Maritime', 'United States', 'abbreviation vs full name'),
 (r'^U\.?S\.? Navy,|^U\.?S\.? Navy$|U\.S\. Navy, United States', 'U.S. Navy', 'United States', ''),
 (r'Marine Corps via U\.S\. Army,', 'U.S. Army', 'United States', 'contracted by the Army for a Marine Corps requirement'),
 (r'U\.?S\.? Army|United States Army|US Army', 'U.S. Army', 'United States', 'service-level and unit-level labels of one service'),
 (r'Armament Agency|Armament Inspectorate', 'Polish Armament Agency', 'Poland', 'Armament Agency replaced the Armament Inspectorate in 2022 - same procurement organisation'),
 (r'3rd Regional Logistics Base', 'Polish 3rd Regional Logistics Base', 'Poland', ''),
 (r'PGZ-NAREW', 'PGZ-NAREW consortium (prime)', 'Poland', 'industrial consortium, not the government buyer'),
 (r'PGZ Group contractor', 'PGZ Group contractor (undisclosed)', 'Poland', ''),
 (r'WB Electronics', 'WB Electronics (prime)', 'Poland', ''),
 (r'ZM Tarn', 'ZM Tarnow (prime)', 'Poland', ''),
 (r'BAAINBw|Bundestag Budget Committee|Bundeswehr and Netherlands', 'BAAINBw / Bundeswehr', 'Germany', 'BAAINBw, Bundeswehr and the Bundestag budget approval are one German procurement route'),
 (r'Rheinmetall MAN', 'Rheinmetall MAN Military Vehicles (prime)', 'Germany', ''),
 (r'KNDS Deutschland', 'KNDS Deutschland (prime)', 'Germany', ''),
 (r'Netherlands|Defence Materiel Organization|MatlogCo', 'Netherlands MoD / DMO', 'Netherlands', 'MoD, army and its materiel organisation are one procurement body'),
 (r"Direction g|DGA", 'DGA', 'France', 'French and English names of the same agency'),
 (r'UGAP', 'UGAP', 'France', ''),
 (r'OCCAR', 'OCCAR', 'France/Belgium', ''),
 (r'DASA|Dstl', 'DASA / Dstl', 'United Kingdom', 'accelerator and laboratory funding route'),
 (r'Submarine Delivery Agency', 'UK Submarine Delivery Agency', 'United Kingdom', ''),
 (r'UK Ministry of Defence|Defence Equipment & Support|Royal Navy|British Army|UK MOD', 'UK Ministry of Defence / DE&S', 'United Kingdom', 'MoD, DE&S and the user services are one contracting route'),
 (r'Assam Rifles', 'Assam Rifles', 'India', 'with and without the MHA parent label'),
 (r'Advanced Weapons and Equipment India', 'AWEIL (prime)', 'India', ''),
 (r'Industry licensees', 'DRDO technology-transfer licensees', 'India', 'licensing route, not a procurement body'),
 (r'Indian Army|Department of Military Affairs|Ministry of Defence / Indian', 'Indian Army (MoD / DMA)', 'India', 'Indian Army with and without its MoD / DMA parent labels'),
 (r'Hanwha Def', 'Hanwha Defence Australia (prime)', 'Australia', 'spelling and end-user-label variants'),
 (r'Rheinmetall Defence Australia', 'Rheinmetall Defence Australia (prime)', 'Australia', ''),
 (r'Australian Department of Defence|Australian Defence Force|Royal Australian Navy|Commonwealth of Australia', 'Australian Department of Defence', 'Australia', 'department, ADF and RAN labels of one buyer'),
 (r'Abu Dhabi Ship Building', 'Abu Dhabi Ship Building (prime)', 'United Arab Emirates', 'shipbuilder named with several end-customer suffixes'),
 (r'UAE Nav|Ministry of Defence and UAE', 'UAE Ministry of Defence / Navy', 'United Arab Emirates', 'naming variants'),
 (r'Kuwait', 'Kuwait MoD / Naval Force', 'Kuwait', 'naming variants'),
 (r'DSTA|MINDEF', 'Singapore DSTA / MINDEF', 'Singapore', 'agency and ministry labels of one buyer'),
 (r'Nordic military cooperation', 'Nordic defence-materiel cooperation', 'Norway/Denmark/Sweden', ''),
 (r'DALO|FMI', 'Danish DALO / FMI', 'Denmark', 'Danish and English names of the same agency'),
 (r'Norwegian Defence Logistics', 'Norwegian Defence Logistics Organisation', 'Norway', ''),
 (r'Norwegian Defence Materiel|Forsvarsmateriell', 'Norwegian Defence Materiel Agency', 'Norway', ''),
 (r'FMV|Swedish Defence Materiel', 'Swedish FMV', 'Sweden', ''),
 (r'Finnish Navy', 'Finnish Navy', 'Finland', ''),
 (r'European Defence Agency', 'European Defence Agency', 'EU', 'with and without the participating-country list'),
 (r'European Commission|European Defence Fund|European Union', 'European Commission / European Defence Fund', 'EU', 'EC, EU and EDF labels plus consortium suffixes are one funding body'),
 (r'NATO DIANA', 'NATO DIANA', 'NATO', ''),
 (r'NATO Support and Procurement', 'NSPA', 'NATO', ''),
 (r'Presidency of Defence Industries', 'Turkish Presidency of Defence Industries (SSB)', 'Turkey', ''),
 (r'Turkish Ministry of National Defence', 'Turkish Ministry of National Defence', 'Turkey', 'with and without the airfield-command suffix'),
 (r'Turkish public-sector buyer|TSK-linked', 'Turkish public-sector buyer (undisclosed)', 'Turkey', 'two undisclosed-authority labels for the same procurement listing type'),
 (r'BMC Savunma', 'BMC Savunma (prime)', 'Turkey', ''),
 (r'armasuisse', 'armasuisse', 'Switzerland', ''),
 (r'IDF', 'IDF Technological and Logistics Directorate', 'Israel', 'IDF and its logistics directorate recorded as one buyer'),
 (r'Belgian', 'Belgian Ministry of Defence', 'Belgium', 'ministry, defence and council-of-ministers labels of one buyer'),
 (r'General Dynamics Land Systems', 'General Dynamics Land Systems-Canada (prime)', 'Canada', ''),
 (r'Government of Canada', 'Government of Canada', 'Canada', ''),
 (r'Angolan', 'Angolan Navy', 'Angola', ''),
 (r'Ukrain', 'Ukrainian Armed Forces', 'Ukraine', ''),
 (r'Luxembourg', 'Luxembourg Directorate of Defence', 'Luxembourg', ''),
 (r'Oshkosh Defense', 'Oshkosh Defense (prime)', 'United States', ''),
 (r'Undisclosed defense customer', 'Undisclosed defence customer', 'Undisclosed', ''),
]

def canon_buyer(raw):
    s = raw.strip('[] ').strip()
    for pat, name, country, reason in RULES:
        if re.search(pat, s, re.I):
            return name, country, reason
    # fall back: strip the trailing country and keep the name as given
    parts = [p.strip() for p in s.split(',')]
    country = parts[-1] if len(parts) > 1 else 'Undisclosed'
    return ', '.join(parts[:-1]) or s, country, ''

def canon_supplier(raw):
    return SUPPLIER.get(raw.strip(), raw.strip())
