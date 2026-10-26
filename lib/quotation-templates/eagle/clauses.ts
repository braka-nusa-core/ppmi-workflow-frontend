// FILE: lib/quotation-templates/eagle/clauses.ts
// ═══════════════════════════════════════════════════════════════
// EAGLE OCEAN MARINE — SOURCE WORDING (verbatim)
//
// GENERATED from the supplied sample “Draft-Quote PT. BHINA CITRA SUPLARINDO”
// (quotation 2025/18599, 09-OCT-2025) by extracting its text and line geometry.
// Wording is therefore copied, not retyped — including its irregularities
// (“The insurance term are as defined”, missing final full stop after
// “disclosed” on page 9, mixed quote styles). Do NOT edit wording here
// without formal PPMI approval.
//
// Line structure: where the sample breaks a line by hand (indented list items,
// short deductible sentences) each line is its own entry with gapBefore 0.
// Numbers that PPMI types per quotation are written as {{slot}} placeholders
// (see EagleAmountSlot); every other character is fixed text.
// `gapBefore` / `pitch` are measured layout hints (pt), not content.
// ═══════════════════════════════════════════════════════════════

import type { EagleBodyElement, EagleClauseParagraph } from './types'

/** Page 1, between the header block and the date: seven paragraphs. */
export const EAGLE_INTRO_PARAGRAPHS: EagleClauseParagraph[] = [
    { text: "This is a quotation for Protection and Indemnity Insurance from Eagle Ocean Marine. No risk will attach and no policy will commence until a fully completed Application Form has been received, reviewed and accepted by Eagle Ocean Marine", gapBefore: 0 },
    { text: "Subject to acceptance of the terms stated herein, compliance with any requirements and settlement of the premium indicated, the Insurer offers to indemnify the Applicant for all liabilities, losses, costs and expenses which he is liable to pay, arising out of an event which first commences during the policy period in respect of the vessel(s) named herein, in regard to the risks and losses set out in Part Two, Section I of Eagle Ocean Marine's General Terms and Conditions of Cover 01.07.25 (\"General Terms\") which is deemed to be attached to, and form an integral part of, this offer. For the avoidance of doubt, the Applicant hereby confirms that he has reviewed and accepts the entirety of the General Terms and Conditions of Cover 01.07.25 upon which this quotation is predicated.", gapBefore: 5.7 },
    { text: "Subject always to the provisions of every other part of the said General Terms, and subject also to the terms and conditions specific to the insurance of the vessel(s) named herein and set out in the Schedule of Additional Terms and Conditions which attach to and form part of this offer of insurance.", gapBefore: 5.7 },
    { text: "The Contract of Insurance (contained in or evidenced by a Certificate of Insurance, any endorsement or variation thereto and by the General Terms) is subject to English law, the Marine Insurance Act 1906, the Insurance Act 2015 and any modification thereof. However, the Contract of Insurance expressly incorporates certain provisions whereby the Insurer (American Steamship Owners Mutual Protection and Indemnity Association, Inc.) excludes certain provisions of the Insurance Act 2015 and any modification thereof, including certain provisions incorporated by the Enterprise Act 2016. These exclusions are set out in Part 1, Section IV, Section 54 (applicable law) of the General Terms and must be read with care.", gapBefore: 5.7 },
    { text: "This offer is issued by Eagle Ocean Agencies, Inc., trading as Eagle Ocean Marine, on behalf of the Insurer.", gapBefore: 0 },
    { text: "In the placing, administration and every other aspect of this contract of insurance, Eagle Ocean Agencies, Inc., trading as Eagle Ocean Marine, acts as agent of the Insurer and not of the Insured.", gapBefore: 5.7 },
    { text: "This quotation is valid for a period of 30 days from the date of issue.", gapBefore: 5.7 },
]

/** Page 1, below the signature area. */
export const EAGLE_INSURER_PARAGRAPHS: EagleClauseParagraph[] = [
    { text: "Insurer: 100% American Steamship Owners Mutual Protection and Indemnity Association, Inc.", gapBefore: 0 },
    { text: "Notwithstanding the fact that security is to be provided by American Steamship Owners Mutual Protection and Indemnity Association, Inc. the Insured and/or any co-insured(s) named hereon shall not, by virtue of this insurance (if purchased), become members of the Association or be entitled to vote at any meeting of the Association.", gapBefore: 17.1 },
]

/** Page 2, above CONDITIONS (pitch 14.1 in the sample). */
export const EAGLE_FAIR_PRESENTATION: EagleClauseParagraph[] = [
    { text: "This offer for insurance is provided on a fixed cost basis and the insured / co-insured(s) will not, by virtue of this policy, be liable to contribute to any deficiency, or be entitled to benefit from any surplus, in the funding of the Association. The insurance term are as defined in this offer and cover is not subject to the By-Laws and Rules of the Association.", gapBefore: 0 },
    { text: "The applicant named herein, in addition to any party acting on his behalf, is reminded of the obligation to make a fair presentation of the risk, including the duty to disclose all the material circumstances in a clear and accessible manner. Material circumstances are circumstances which would influence the judgement of a prudent insurer in determining whether to insure the risk or not, and if so on what terms including the terms and conditions of the insurance and/or fixing the premium. Failure to make a fair presentation of the risk [or any failure to disclose any change to information previously advised] may entitle the insurers to elect to avoid the insurance, as if the contract of insurance had never existed, [or alternatively to terminate the insurance from inception and to demand repayment of any claims previously paid or costs incurred by them]. If the applicant named herein, or any party acting on his behalf, is in any doubt as to whether information is material, it should be disclosed.", gapBefore: 0 },
]

/** Page 10, closing paragraph under the acceptance block. */
export const EAGLE_DISCLAIMER: EagleClauseParagraph[] = [
    { text: "This is not a confirmation of cover. The insurance can only be underwritten if all required information by the Company, is provided to and accepted by the Company. Any alteration to the above information must be reported to PT.Pandi Proteksi Marine Indonesia immediately with full details of the alterations. We trust that everything is in order and look forward to receiving your further instructions.", gapBefore: 0 },
]

/** Page 9, under the PREMIUM section — same wording as page 2 but without the final full stop. */
export const EAGLE_FAIR_PRESENTATION_REPEAT: EagleClauseParagraph[] = [
  { text: "The applicant named herein, in addition to any party acting on his behalf, is reminded of the obligation to make a fair presentation of the risk, including the duty to disclose all the material circumstances in a clear and accessible manner. Material circumstances are circumstances which would influence the judgement of a prudent insurer in determining whether to insure the risk or not, and if so on what terms including the terms and conditions of the insurance and/or fixing the premium. Failure to make a fair presentation of the risk [or any failure to disclose any change to information previously advised] may entitle the insurers to elect to avoid the insurance, as if the contract of insurance had never existed, [or alternatively to terminate the insurance from inception and to demand repayment of any claims previously paid or costs incurred by them]. If the applicant named herein, or any party acting on his behalf, is in any doubt as to whether information is material, it should be disclosed", gapBefore: 0 },
]

/** Pages 2–9: CONDITIONS, then the boxed sections in printed order (INFORMATION and COASSUREDS are tables, see template.ts). */
export const EAGLE_BODY: EagleBodyElement[] = [
  { kind: 'row', id: 'E01', labelLines: ["CONDITIONS:"], pitch: 11.3, paragraphs: [
    { text: "All terms, clauses and conditions as detailed in the Eagle Ocean Marine General Terms and Conditions of Cover policy dated 01.07.25 and as detailed below. Said Terms and Conditions can be found on the Insurers website www.eagleoceanmarine.com or by hard copy available from Eagle Ocean Agencies Inc, trading as Eagle Ocean Marine", gapBefore: 0 },
    { text: "H&M Cover", gapBefore: 11.3 },
    { text: "Attention is drawn to Part One Section IV sub-section 15 of the above Eagle Ocean Marine General Terms and Conditions of Cover, which require, unless otherwise agreed, the vessel to have H&M cover on terms no less favourable than that provided by the Institute Time Clauses - Hull 1/10/83 or 1/11/95 - and Institute War and Strikes Clauses - Hull - 1.11.95. Both with an insured value equivalent to, or higher than, the market value of the insured vessel (being available for sale, free of commitment.)", gapBefore: 0 },
    { text: "P&I Cover - War etc. risks", gapBefore: 11.3 },
    { text: "In the event that Insurers are required to issue confirmation of insurance for pollution risks (by way of a \"bunker blue card\" or a \"tanker blue card\") it will be a requirement that either;", gapBefore: 0 },
    { text: "(a) the insured has in effect throughout the duration of this policy, a separate (primary) War etc. risk policy covering liability", gapBefore: 0, indent: 23 },
    { text: "for Pollution with a limit of liability equivalent to, or higher than,", gapBefore: 0, indent: 25 },
    { text: "the market value of the insured vessel or", gapBefore: 0, indent: 25 },
    { text: "(b) that cover hereon has been extended to include primary War & Terrorism etc. risks cover for pollution, subject to an agreed", gapBefore: 0, indent: 23 },
    { text: "additional premium.", gapBefore: 0, indent: 25 },
    { text: "This quotation excludes liability arising from War and/or Terrorism etc. other than as stated in the terms and conditions set out below.", gapBefore: 11.3 },
  ] },
  { kind: 'bar', id: 'E02', text: "COVER TERMS - GENERAL" },
  { kind: 'row', id: 'E03', labelLines: ["1/4TH COLLISION", "LIABILITY"], pitch: 14.2, paragraphs: [
    { text: "Coverage hereunder, pursuant to Part Two of the General Terms and Conditions of Cover, Section 1 (P&I). Sub-Section 3 (Collision), Paragraph 1, includes one-fourth of the liability insured therein.", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E04', labelLines: ["SURVEY WITHIN 30", "DAYS"], pitch: 14.2, paragraphs: [
    { text: "Coverage hereunder is subject to the vessel undergoing a condition survey by a surveyor approved by underwriters within 30 days of attachment. For guidance please see details on the following link: (https://www.eagleoceanmarine.com/surveys.php). The cost of said survey and any follow up survey to be for the account of the Insured. Until such time as the vessel passes survey and such is confirmed by the Insurers in writing, all liabilities, costs and expenses of whatsoever nature and howsoever arising, directly or indirectly, from any deficiency in the management, or defect in the vessel, discovered during the survey, or which would have been discovered had the survey been completed prior to attachment, are excluded absolutely. Whether any liability, cost or expense arises from any deficiency or defect, or whether any deficiency or defect would have been discovered had the survey been completed prior to attachment, shall be solely and exclusively determined by Insurers. Failure by the assured to present the vessel for survey (or any subsequent follow-up survey) by such time and date as shall have been stipulated by EOM shall have the effect of automatically terminating cover from inception without further notice. Subsequent repairs to any defects are to be effected within the time frame stipulated by EOM.", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E05', labelLines: ["SANCTIONS LIMITATION", "AND EXCLUSION"], pitch: 14.2, paragraphs: [
    { text: "No insurer shall be deemed to provide cover and no insurer shall be liable to pay any claim or provide any benefit hereunder to the extent that the provision of such cover, payment of such claim or provision of such benefit would expose that insurer to any sanction, prohibition or restriction under United Nations resolutions or the trade or economic sanctions, laws or regulations of the European Union, United Kingdom or United States of America.", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E06', labelLines: ["CREW CONTRACTS"], pitch: 14.2, paragraphs: [
    { text: "Subject to sight and approval of crew contracts.", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E07', labelLines: ["CONTRACTS OF", "CARRIAGE"], pitch: 14.2, paragraphs: [
    { text: "Subject to cargo being carried under approved contracts of carriage", gapBefore: 0 },
  ] },
  { kind: 'bar', id: 'E08', text: "TRADING AREA" },
  { kind: 'row', id: 'E09', labelLines: ["TRADING AREA"], pitch: 14.2, paragraphs: [
    { text: "Warranted trading Indonesian waters only", gapBefore: 0 },
  ] },
  { kind: 'bar', id: 'E10', text: "EXPRESS WARRANTIES" },
  { kind: 'row', id: 'E11', labelLines: ["WARRANTED CLASS", "MAINTAINED"], pitch: 14.2, paragraphs: [
    { text: "It is warranted that the insured vessel is classed and that class is maintained with an approved society", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E12', labelLines: ["CREW MEDICAL"], pitch: 14.2, paragraphs: [
    { text: "Warranted all crew and officers undertake and pass a pre employment medical examination before employment on board the insured vessel.", gapBefore: 0 },
  ] },
  { kind: 'bar', id: 'E13', text: "EXCLUSIONS" },
  { kind: 'row', id: 'E14', labelLines: ["JLC TERRITORIAL AND", "CONFLICT EXCLUSION", "CLAUSE"], pitch: 14.2, paragraphs: [
    { text: "1. This policy excludes all loss, damage, liability, cost or expense:", gapBefore: 0 },
    { text: "(a) caused by or arising from or in connection with any Russia-Ukraine conflict and/or any expansion of such conflict; or", gapBefore: 14.2 },
    { text: "(b) in any area or territory or territorial waters where Russian armed forces, Russian-backed forces, and/or Russian authorities, are engaged in conflict within the territories (including territorial waters) of the Russian Federation, Belarus, Ukraine and any disputed regions of Ukraine, the Crimean Peninsula and the Republic of Moldova.", gapBefore: 14.2 },
    { text: "(c) arising from capture, seizure, arrest, detainment, confiscation, nationalisation, expropriation, deprivation or requisition for title or use, or the restraint of movement of vessels and cargo in the territories (including territorial waters) of the Russian Federation, Belarus, Ukraine and any disputed regions of Ukraine, the Crimean Peninsula, and the Republic of Moldova.", gapBefore: 14.2 },
  ] },
  { kind: 'row', id: 'E15', labelLines: ["JLC LIMITED NOTICE OF", "CANCELLATION"], pitch: 14.2, paragraphs: [
    { text: "1. Notice of Cancellation (\"Notice\")", gapBefore: 0 },
    { text: "Where this policy includes liability, loss, damage, cost or expense caused by, arising out of or in any way connected with one or more of the following risks:", gapBefore: 0 },
    { text: "1.1 war, civil war, revolution, rebellion, insurrection, or civil strife arising therefrom, or any hostile act by or against a belligerent power;", gapBefore: 14.2 },
    { text: "1.2 capture, seizure, arrest, restraint, or detainment, and the consequences thereof or any attempt thereat;", gapBefore: 14.2 },
    { text: "1.3 derelict mines, torpedoes, bombs, or other derelict weapons of war;", gapBefore: 14.2 },
    { text: "1.4 strikes, locked-out workmen, or persons taking part in labour disturbances, riots or civil commotions;", gapBefore: 14.2 },
    { text: "1.5 terrorism, or any person acting maliciously or from a political motive;", gapBefore: 14.2 },
    { text: "1.6 confiscation, nationalisation, expropriation, deprivation or requisition, this policy may be cancelled in respect of these risks only by the Insurer giving 72 hours' notice of cancellation (hereinafter \"Notice\"), with Notice being effective from midnight Greenwich Mean Time on the day Notice is given by the Insurer.", gapBefore: 14.2 },
    { text: "The Insurer may subsequently agree to reinstate cover, if required, at terms to be agreed by the Insurer. Any reinstatement of cover shall occur at a time to be agreed by the Insurer.", gapBefore: 14.2 },
    { text: "2. Automatic Termination", gapBefore: 14.2 },
    { text: "2.1 Whether or not the notice of cancellation described in clause 1 has been given, this Additional Coverage shall TERMINATE AUTOMATICALLY:", gapBefore: 14.2 },
    { text: "2.1.1 upon the occurrence of any hostile detonation of any nuclear weapon of war, wheresoever or whensoever such detonation may occur, and/or", gapBefore: 14.2 },
    { text: "2.1.2 upon the outbreak of war (whether there be a declaration of war or not) between any of the following countries: United Kingdom, United States of America, France, the Russian Federation, the People's Republic of China.", gapBefore: 14.2 },
  ] },
  { kind: 'row', id: 'E16', labelLines: ["EXCLUDING", "WORKMEN'S", "COMPENSATION"], pitch: 14.2, paragraphs: [
    { text: "Notwithstanding the provisions of Part Two, Section One, Sub-section 1 (Loss of Life, Injury and Illness) this Certificate of Insurance excludes all claims or such proportions thereof as are recoverable under any Workmen’s Compensation Act, Social Security Scheme or other ordinance passed by the government of any country, nation or state thereof and the local statutory and/or obligatory insurances arising therefrom", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E17', labelLines: ["EXCLUDING PIRACY"], pitch: 14.2, paragraphs: [
    { text: "Excluding all claims of whatsoever nature and howsoever arising from piracy, barratry or violent theft from persons outside the vessel, the consequences thereof and any attempt thereat.", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E18', labelLines: ["MARINE CYBER", "ENDORSEMENT"], pitch: 14.2, paragraphs: [
    { text: "1. Subject only to paragraph 3 below, it is understood and agreed that the terms of entry do not provide coverage for, and expressly exclude coverage for, any and all liabilities, costs, claims, fines, penalties, losses, damages or expenses directly or indirectly caused by or contributed to, by or arising from the use or operation, as a means for inflicting harm, of any computer, computer system, computer software program, malicious code, computer virus, computer process or any other electronic system.", gapBefore: 0 },
    { text: "2. Subject to the terms of entry, the indemnity otherwise recoverable hereunder shall not be prejudiced by the use or operation of any computer, computer system, computer software program, computer process or any other electronic system, if such use or operation is not as a means for inflicting harm.", gapBefore: 14.2 },
    { text: "3. Where this clause is endorsed on policies covering risks of war, civil war, revolution, rebellion, insurrection, or civil strife arising therefrom, or any hostile act by or against a belligerent power, or terrorism or any person acting from a political motive, paragraph 1 shall not operate to exclude losses (which would otherwise be covered) arising from the use of any computer, computer system or computer software program or any other electronic system in the launch and/ or guidance system and/or firing mechanism of any weapon or missile.", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E19', labelLines: ["WHO DECLARED", "COMMUNICABLE", "DISEASE (\"WDCD\")", "CLAUSE"], pitch: 14.2, paragraphs: [
    { text: "1. In the event that the World Health Organization (‘WHO’) has determined an outbreak of a Communicable Disease to be a Public Health Emergency of International Concern (a ‘Declared Communicable Disease’), no coverage will be provided under this insurance/(re)insurance for any loss, damage, liability, cost or expense directly arising from any transmission or alleged transmission of the Declared Communicable Disease.", gapBefore: 0 },
    { text: "2. The exclusion in paragraph 1 of this clause will not apply to any liability of the insured/(re)insured otherwise covered by this insurance/(re)insurance where the liability directly arises from an identified instance of a transmission of a Declared Communicable Disease and where the insured/(re)insured proves that identified instance of a transmission took place before the date of determination by the WHO of the Declared Communicable Disease.", gapBefore: 0 },
    { text: "3. However even if the requirements of paragraph 2 of this clause are met, no coverage will be provided under this insurance/(re)insurance for any:", gapBefore: 0 },
    { text: "A. liability, cost or expense to identify, clean up, detoxify, remove, monitor, or test for the Declared Communicable Disease whether the measures are preventative or remedial;", gapBefore: 0 },
    { text: "B. liability for or loss, cost or expense arising out of any loss of revenue, loss of hire, business interruption, loss of market, delay or any indirect financial loss, howsoever described, as a result of the Declared Communicable Disease;", gapBefore: 0 },
    { text: "C. loss, damage, liability, cost or expense caused by or arising out of fear of or the threat of the Declared Communicable Disease.", gapBefore: 0 },
    { text: "4. As used in this clause, Communicable Disease means any disease, known or unknown, which can be transmitted by means of any substance or agent from any organism to another organism where:", gapBefore: 14.2 },
    { text: "A. the substance or agent includes but is not limited to a virus, bacterium, parasite or other organism or any variation or mutation of any of the foregoing, whether deemed living or not, and", gapBefore: 0 },
    { text: "B. the method of transmission, whether direct or indirect, includes but is not limited to human touch or contact, airborne transmission, bodily fluid transmission, transmission to or from or via any solid object or surface or liquid or gas, and", gapBefore: 0 },
    { text: "C. the disease, substance or agent may, acting alone or in conjunction with other comorbidities, conditions, genetic susceptibilities, or with the human immune system, cause death, illness or bodily harm or temporarily or permanently impair human physical or mental health or adversely affect the value of or safe use of property of any kind.", gapBefore: 0 },
  ] },
  { kind: 'bar', id: 'E20', text: "SUB-LIMITS" },
  { kind: 'row', id: 'E21', labelLines: ["CREW LIMIT"], pitch: 14.2, paragraphs: [
    { text: "Claims in respect of liability to seamen under Part Two, Section 1, Paragraph B, are limited to a maximum of US$ {{crewLimit}} each person, each accident or occurrence.", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E22', labelLines: ["WDCD SUB-LIMIT"], pitch: 14.2, paragraphs: [
    { text: "Notwithstanding the foregoing maximum limit of liability stated in this Certificate of Insurance, a Sub-Limit of Liability of US${{wdcdSubLimit}} per vessel per event and in the aggregate any one policy year shall be applicable to any and all liabilities, costs, claims, fines, penalties, losses, damages or expenses which would have been otherwise recoverable hereunder but for the WDCD Clause stated in this Certificate of Insurance.", gapBefore: 0 },
  ] },
  { kind: 'bar', id: 'E23', text: "DEDUCTIBLES" },
  { kind: 'row', id: 'E24', labelLines: ["CREW CLAIMS"], pitch: 14.2, paragraphs: [
    { text: "USD {{crewClaims}} from all crew claims, each accident or occurrence", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E25', labelLines: ["CARGO CLAIMS"], pitch: 14.2, paragraphs: [
    { text: "USD {{cargoClaims}} from all cargo claims, each single voyage", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E26', labelLines: ["COLLISION LIABILITY", "CLAIMS"], pitch: 14.2, paragraphs: [
    { text: "USD {{collisionClaims}} from all collision claims (RDC), each accident or occurrence", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E27', labelLines: ["DAMAGE TO FIXED &", "FLOATING OBJECTS"], pitch: 14.2, paragraphs: [
    { text: "USD {{ffoClaims}} from all claims in respect of damage to third party property", gapBefore: 0 },
    { text: "(F&FO), each accident or occurrence", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E28', labelLines: ["OTHER CLAIMS"], pitch: 14.2, paragraphs: [
    { text: "USD {{otherClaims}} from all other claims, each accident or occurrence", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E29', labelLines: ["TOTAL LOSS"], pitch: 14.2, paragraphs: [
    { text: "A further deduction (in addition to any other applicable deductible) of US${{totalLoss}}, will be applied to all claims arising from the total or constructive", gapBefore: 0 },
    { text: "total loss of the vessel.", gapBefore: 0 },
  ] },
  { kind: 'row', id: 'E30', labelLines: ["COSTS & EXPENSES"], pitch: 14.2, paragraphs: [
    { text: "Deductibles include all costs, fees and expenses incurred or approved by the insurer.", gapBefore: 0 },
  ] },
  { kind: 'bar', id: 'E31', text: "WAR AND TERRORISM" },
  { kind: 'row', id: 'E32', labelLines: ["EXCESS POLLUTION", "(WAR RISKS)"], pitch: 14.2, paragraphs: [
    { text: "Coverage hereunder, pursuant to Part Two of the General Terms and Conditions of Cover, Section III (War and Terrorism) is limited to amounts which are not recoverable under the insured vessel's war risk policy solely by virtue of the claim exceeding an amount equal to the insured vessel's hull and machinery value which is warranted to be maintained in force with a value / limit of not less than the current market value of the vessel. The maximum amount recoverable hereon being limited to the difference between the market value of the vessel at the time of the incident and the limit of liability as defined in the relevant International pollution convention under which the claim is made.", gapBefore: 0 },
  ] },
  { kind: 'bar', id: 'E33', text: "PREMIUM" },
  { kind: 'row', id: 'E34', labelLines: ["THREE INSTALMENTS"], pitch: 14.2, paragraphs: [
    { text: "Annual premium is earned at inception and is payable in three equal instalments. The first instalment is to be received by Eagle Ocean Marine within 30 calendar days from inception.", gapBefore: 0 },
    { text: "The second instalment is to be received by Eagle Ocean Marine within 60 calendar days from inception.", gapBefore: 0 },
    { text: "The third instalment is to be received by Eagle Ocean Marine within 90 calendar days from inception.", gapBefore: 0 },
    { text: "In the event of non payment of any instalment on or before the instalment date, the Insurer may give the Insured notice in writing requiring him to pay such amounts by any date specified in such notice, not being less than five (5) days from the date on which such notice is sent by the Insurer. In the event that the Insured fails to make payment in full on or before the date so specified, the insurance (whether or not such insurance may already have ceased for any other reason) in respect of any and all vessels insured for account or on behalf of the Insured shall be terminated immediately without any further notice or other formality.", gapBefore: 0 },
    { text: "In the event of termination of the insurance prior to the natural expiry date, underwriters may (at their discretion) agree to return premium pro rata to the unexpired time on risk. Any such return may be subject to a deduction of 15%for costs.", gapBefore: 0 },
    { text: "In the event that this risk forms an addition to an existing fleet insurance program, the initial premium instalment will be calculated pro rata (and due within 30 days of cover attaching) and any further instalments will be debited in- line with the remaining fleet instalments (and due on the same dates).", gapBefore: 0 },
  ] },
]