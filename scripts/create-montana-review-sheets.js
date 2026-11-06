#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const checked = "November 5, 2026";

// State and national rows are verified once and reused in every Montana sheet.
const shared = [
  ["Montana 211", "Montana", "211", "https://montana211.org/", "Call 211 or search by county and need for current services; confirm the provider's service area, intake, hours, and availability directly."],
  ["Montana DPHHS Online Benefits Application", "Montana", "1-888-706-1535", "https://apply.mt.gov/access/jsp/access/Home.jsp", "Screen or apply for SNAP, TANF, Medicaid, Healthy Montana Kids, or heating assistance and save the confirmation and every notice."],
  ["Montana Medicaid Member Services", "Montana", "1-800-362-8312", "https://dphhs.mt.gov/MontanaHealthcarePrograms/MemberServices", "Call about current medical benefits, provider questions, coverage notices, or transportation and confirm any deadline before changing coverage."],
  ["Montana Low Income Home Energy Assistance Program", "Montana", "1-833-317-1080", "https://dphhs.mt.gov/hcsd/energyassistance/", "Apply through the official portal or contact the listed local eligibility office; confirm the heating-season window, documents, and current funding."],
  ["Montana Substance Use Disorder Services and Provider Directory", "Montana", "", "https://dphhs.mt.gov/BHDD/SubstanceAbuse/treatmentproviderinformation", "Use the county provider list to contact a state-approved program and confirm intake, level of care, insurance or cost, and current availability."],
  ["Montana Coalition Against Domestic and Sexual Violence", "Montana", "1-888-404-7794", "https://www.mcadsv.com/victim-service-programs-by-region/", "Use the regional directory or call for connection to a local victim-service program from a safe device when possible; call 911 for immediate danger."],
  ["Montana Legal Services Association", "Montana", "1-800-666-6899", "https://www.mtlsa.org/apply-for-services/", "Complete the civil legal-aid intake online or by phone and identify any court, eviction, benefits, protection-order, or other urgent deadline."],
  ["Montana Office of Consumer Protection", "Montana", "1-800-481-6896 · 406-444-4500", "https://dojmt.gov/office-of-consumer-protection/", "Review the official consumer guidance or complaint process and keep contracts, receipts, notices, and prior communications."],
  ["Montana Vocational Rehabilitation and Blind Services", "Montana", "1-877-296-1197", "https://www.dphhs.mt.gov/detd/vocrehab/", "Contact the consumer line or local office to request orientation and confirm disability-related employment eligibility, assessment, and documents."],
  ["Montana Milestones Part C Early Intervention", "Montana", "406-444-5647", "https://dphhs.mt.gov/ecfsd/childcare/montanamilestones/", "Use the regional provider list to request a birth-to-age-three developmental referral and ask what information is needed; a referral does not promise eligibility."],
  ["Montana Empowerment Center Parent Training and Information Center", "Montana", "1-877-870-1190", "https://mtempowermentcenter.org/", "Ask for family-to-family information about evaluations, special education, IEPs, early intervention, transition, or disability services."],
  ["Montana Developmental Disabilities Program", "Montana", "406-444-2995", "https://www.dphhs.mt.gov/bhdd/DisabilityServices/developmentaldisabilities/", "Contact the program to ask about developmental-disability eligibility, regional intake, case management, and waiver or community-service options."],
  ["988 Suicide & Crisis Lifeline", "United States", "Call or text 988", "https://988lifeline.org/", "Call or text 988 now, or use the official chat. Call 911 for immediate physical danger or a life-threatening medical emergency."],
  ["National Call Center for Homeless Veterans", "United States", "1-877-424-3838", "https://department.va.gov/homeless/", "Call the national center and provide the veteran's current location and immediate need. Call 911 for immediate danger."],
  ["IRS Free Tax Preparation (VITA/TCE)", "United States", "1-800-906-9887", "https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers", "Use the official locator during tax season, then call the site to confirm dates, eligibility, appointment rules, and required documents."]
];

const places = [
  {
    slug: "lewis-and-clark-county",
    title: "Lewis and Clark County",
    local: [
      ["Lewis and Clark Public Health Immunization Clinic", "Lewis and Clark County", "406-457-8900", "https://www.lccountymt.gov/Government/Public-Health/Immunizations", "Call to schedule and confirm vaccine availability, cost, insurance, eligibility, records, identification, and consent requirements before traveling."],
      ["Lewis and Clark County WIC", "Lewis and Clark, Broadwater, and Meagher county clinic locations", "406-457-8912", "https://www.lccountymt.gov/Government/Public-Health/Pregnancy-and-Parenting/Women-Infant-Children-Supplemental-Nutrition-Program", "Call or use the official participant portal to request an appointment and confirm clinic location, eligibility, identification, residency, and income records."],
      ["Helena Food Share", "Greater Helena area", "406-443-3663", "https://helenafoodshare.org/", "Check the current shopping locations and hours, then call before traveling if weather, transportation, mobility, or dietary needs could affect the visit."],
      ["God's Love Shelter", "Helena and surrounding area", "406-442-7000 ext. 3", "https://godsloveshelter.org/", "Call before traveling to ask about current adult or family shelter intake, meals, rules, capacity, and required check-in steps; a bed is not guaranteed."],
      ["Helena Housing Authority", "Lewis and Clark, Broadwater, and Jefferson counties", "406-442-7970", "https://hhamt.org/", "Use the official applicant portal to check current housing and voucher wait lists, then save the application confirmation and keep contact information current."],
      ["Rocky Mountain Development Council Community and Energy Services", "Lewis and Clark, Broadwater, and Jefferson counties", "406-447-1680 · Energy: 406-447-1625", "https://www.rmdc.net/what-we-do/programs-services.html", "Contact the relevant program for current energy, housing, Head Start, meal, aging, or community-service intake and confirm documents and funding."],
      ["PureView Health Center", "Lewis and Clark County and Helena-area clinics", "406-457-0000", "https://www.pureviewhealthcenter.org/services", "Call for medical, dental, behavioral-health, pharmacy, substance-use, or insurance-assistance access and ask about appointments, walk-ins, insurance, and sliding-fee documents."],
      ["Helena Indian Alliance", "Helena area; culturally responsive services with American Indian community focus", "406-449-5796 · Crisis: 406-459-4204", "https://hia-mt.org/care", "Call to confirm current primary, behavioral-health, substance-use, pharmacy, or community-support access, appointments, cost, and eligibility."],
      ["Many Rivers Whole Health — Helena", "Helena and surrounding service area", "406-443-7151", "https://manyriverswholehealth.org/contact/", "Call or use walk-in instructions for current mental-health or substance-use assessment and confirm intake, insurance or cost, and available services; call 988 for crisis support."],
      ["The Friendship Center", "Lewis and Clark, Broadwater, and Jefferson counties", "24-hour help line: 406-442-6800", "https://www.thefriendshipcenter.org/our-services", "Call from a safe device if possible for confidential domestic-violence, sexual-assault, or stalking support, safety planning, shelter, and advocacy; call 911 for immediate danger."],
      ["Helena Job Service", "Helena and surrounding labor market", "406-447-3200", "https://montanaworks.gov/job-service-montana/", "Contact the Helena office for job search, résumé, unemployment-system navigation, training, or employer referrals and confirm current appointment or registration steps."],
      ["Helena Adult Learning Center", "Helena area", "406-447-6387", "https://adultlearningcenter.helenaschools.org/", "Contact the center to confirm orientation, open enrollment, HiSET or GED preparation, literacy, math, college, employment, schedule, and testing steps."],
      ["Child Care Resources", "Lewis and Clark County and western Montana service region", "406-728-6446 · 1-800-728-6446", "https://dphhs.mt.gov/ecfsd/ChildCare/ChildCareResourceandReferral", "Ask for child-care referrals and Best Beginnings scholarship help, then confirm openings, licensing, hours, cost, eligibility, and wait lists with providers."],
      ["Capital Transit and Curb-to-Curb Service", "Helena city limits with limited East Helena and East Valley service", "406-447-8080 ext. 1", "https://www.helenamt.gov/Departments/Transportation-Systems/Capital-Transit", "Check current routes or request demand-response information and confirm eligibility, reservation notice, fare, pickup area, accessibility, and service alerts."],
      ["Area IV Agency on Aging and Disability Resource Center", "Lewis and Clark, Broadwater, Gallatin, Jefferson, Meagher, and Park counties", "406-447-1680 · 1-800-551-3191", "https://www.dphhs.mt.gov/SLTC/aging/adrc/", "Call and describe the older or disabled person's location, daily-living needs, caregiver situation, transportation needs, and most urgent concern."],
      ["Lewis and Clark Humane Society", "Lewis and Clark County", "406-442-1660", "https://lchsmontana.org/services/", "Review current pet-food, veterinary-bill, spay or neuter, lost-pet, rehoming, and surrender options; call before visiting because capacity and eligibility change."],
      ["Montana Veterans Affairs — Helena Service Office", "Helena region", "406-324-4774", "https://veterans.mt.gov/Veteran-Services/Veteran-Services-Program-Home", "Contact the service office for claims and benefits help and ask which discharge, identity, medical, income, and dependent records to bring."],
      ["Lewis and Clark County RAVE Alert and Smart911", "Lewis and Clark County", "", "https://www.helenamt.gov/Departments/Police-Department/911-Communication-Center", "Enroll in the official alert system, choose contact methods, keep the location current, and follow evacuation or protective instructions when issued."],
      ["National Weather Service Great Falls", "Lewis and Clark County and north-central Montana forecast area", "", "https://www.weather.gov/greatfalls/", "Check the current forecast, watches, warnings, and fire-weather information for the correct community and follow local emergency instructions."],
      ["Lewis and Clark Library", "Lewis and Clark County branches and mobile services", "406-447-1690", "https://www.lclibrary.org/129/Helena", "Choose a branch and confirm hours, card rules, computer and internet access, printing, classes, meeting spaces, and registration requirements."],
      ["Volunteer Helena", "Greater Helena area", "406-442-4360", "https://www.volunteerhelena.org/", "Search current opportunities and confirm the host, location, schedule, age, screening, orientation, waiver, and registration requirements before participating."]
    ]
  },
  {
    slug: "yellowstone-county",
    title: "Yellowstone County",
    local: [
      ["RiverStone Health", "Yellowstone County and regional clinic service area", "406-247-3350 · Immunizations: 406-247-3382", "https://riverstonehealth.org/appointments/", "Call for primary, dental, behavioral, immunization, or public-health services and confirm appointments, walk-ins, insurance, sliding-fee documents, and vaccine supply."],
      ["RiverStone Health WIC", "Yellowstone, Carbon, Musselshell, and Stillwater counties", "406-247-3370", "https://riverstonehealth.org/healthy-starts/women-infants-children-wic/", "Call or use the official participant portal to request an appointment and confirm eligibility, clinic location, identification, residency, and income records."],
      ["Billings Food Bank", "Billings and Yellowstone County area", "406-259-2856", "https://www.billingsmt.gov/3276/Food-Services", "Review the current food-service information and call before traveling because hours, supplies, service area, and intake rules can change."],
      ["Family Service Billings", "Yellowstone County area", "406-259-2269", "https://billingsfamilyservice.org/", "Contact the agency to ask about current food, rent or mortgage, deposit, prescription, clothing, or case-management help and confirm documents and funding."],
      ["District 7 Human Resources Development Council", "Big Horn, Carbon, Stillwater, Sweet Grass, and Yellowstone counties", "406-247-4732 · 1-800-433-1411", "https://hrdc7.org/", "Contact the relevant program for current housing, energy, transportation, child-care, employment, or community-service intake and confirm documents and funding."],
      ["Montana Rescue Mission", "Billings and Yellowstone County area", "406-259-6079", "https://montanarescuemission.org/", "Call before traveling to confirm the correct shelter, current intake time, meals, capacity, accessibility, identification, and program rules; a bed is not guaranteed."],
      ["HomeFront", "Billings and Yellowstone County housing program area", "406-245-6391", "https://homefrontpartners.org/", "Check current public-housing and voucher wait-list information, then follow the official application process and keep contact details current."],
      ["Community Crisis Center", "Billings and south-central Montana", "406-259-8800", "https://www.crisiscenterbillings.org/", "Call for current walk-in crisis stabilization and mental-health, substance-use, or social-service access; call 988 for crisis support and 911 for immediate danger."],
      ["Rimrock Foundation", "Billings and regional service area", "406-248-3175 · 1-800-227-3953", "https://www.rimrock.org/", "Call for current substance-use or behavioral-health screening, treatment, and recovery options and confirm intake, cost, insurance, and availability."],
      ["YWCA Billings", "Yellowstone County and surrounding service area", "24-hour help line: 406-245-4472 · Text: 406-702-0229", "https://www.ywcabillings.org/survivor-resources", "Call or text from a safe device if possible for confidential domestic-violence or sexual-assault support, safety planning, shelter, and advocacy; call 911 for immediate danger."],
      ["Billings Job Service", "Billings and surrounding labor market", "406-652-3080", "https://montanaworks.gov/job-service-montana/", "Contact the Billings office for job search, résumé, unemployment-system navigation, training, or employer referrals and confirm current appointment or registration steps."],
      ["Billings Adult Education", "Billings area", "406-281-5005", "https://adulteducation.billingsschools.org/adult-education-home/adult-education-about", "Contact the program to confirm free HiSET or GED preparation, English, college, career, orientation, schedule, testing, and enrollment steps."],
      ["Family Connections Child Care Resource and Referral", "Yellowstone County and eastern Montana service region", "406-761-6010 · 1-800-696-4503", "https://www.familyconnectionsmt.org/contact", "Ask for child-care referrals and Best Beginnings scholarship help, then confirm openings, licensing, hours, cost, eligibility, and wait lists with providers."],
      ["MET Transit and MET Plus", "Billings fixed-route and ADA service area", "406-657-8218", "https://billingsmt.gov/3389/MET", "Check routes and service alerts or request MET Plus eligibility information; confirm certification, reservation notice, fare, pickup area, and accessibility."],
      ["Allies in Aging", "Yellowstone County and surrounding aging-service area", "406-259-9666", "https://www.alliesinaging.org/", "Call and describe the older adult's daily-living, meal, caregiver, benefits, transportation, or safety need and ask for the appropriate current program."],
      ["Yellowstone Valley Animal Shelter", "Billings and Yellowstone County", "406-294-7387", "https://yvas.org/", "Review current lost-pet, adoption, surrender, foster, and owner-support instructions and call before visiting because capacity and intake rules change."],
      ["Montana Veterans Affairs — Billings Service Office", "Billings region", "406-248-8579", "https://veterans.mt.gov/Veteran-Services/Veteran-Services-Program-Home", "Contact the service office for claims and benefits help and ask which discharge, identity, medical, income, and dependent records to bring."],
      ["Yellowstone County Informed", "Yellowstone County and City of Billings", "Text YCINFORM to 888-777", "https://billingsmt.gov/3189/Yellowstone-County-Informed---Powered-by", "Enroll in official alerts, choose contact methods, keep locations current, and follow evacuation or protective instructions when issued."],
      ["National Weather Service Billings", "Yellowstone County and south-central Montana forecast area", "", "https://www.weather.gov/byz/", "Check the current forecast, watches, warnings, and fire-weather information for the correct community and follow local emergency instructions."],
      ["Billings Public Library", "Billings and regional borrowers", "406-657-8258", "https://www.billingslibrary.org/194/Contact-the-Library", "Confirm hours, card rules, computer and internet access, printing, job resources, classes, meeting spaces, and registration requirements."],
      ["United Way of Yellowstone County Volunteer Center", "Yellowstone County", "406-272-8511", "https://uwyellowstone.galaxydigital.com/agency/detail/?agency_id=80601", "Search current opportunities and confirm the host, location, schedule, age, screening, orientation, waiver, and registration requirements before participating."]
    ]
  },
  {
    slug: "missoula-county",
    title: "Missoula County",
    local: [
      ["Missoula Public Health Immunization Clinic", "Missoula County", "406-258-3363", "https://www.missoulapublichealth.org/people/clinic-services/immunizations/", "Call or use current walk-in instructions and confirm vaccine availability, cost, insurance, eligibility, records, identification, and consent requirements."],
      ["Missoula Public Health WIC", "Missoula County clinic locations", "406-258-4740", "https://missoulapublichealth.org/people/wic", "Call or use the official contact form to request an appointment and confirm clinic location, eligibility, identification, residency, and income records."],
      ["Missoula Food Bank and Community Center", "Missoula County area", "406-549-0543", "https://missoulafoodbank.org/", "Check current shopping locations and hours, then call before traveling if weather, transportation, mobility, or dietary needs could affect the visit."],
      ["Poverello Center", "Missoula and Missoula County coordinated-entry area", "406-728-1809 · Outreach: 406-493-7955", "https://thepoverellocenter.org/services/", "Review current shelter, meals, outreach, veteran, and coordinated-entry instructions; call before traveling because capacity and referral requirements can change."],
      ["Missoula Housing Authority", "Missoula County housing program area", "406-549-4113", "https://www.missoulahousing.org/home", "Check current housing and voucher wait-list information, then follow the official application process and keep contact details current."],
      ["Human Resource Council District XI", "Mineral, Missoula, and Ravalli counties", "406-728-3710", "https://www.humanresourcecouncil.org/", "Contact the relevant program for current energy, housing, weatherization, employment, or community-service intake and confirm documents and funding."],
      ["Partnership Health Center", "Missoula County clinic network", "Medical: 406-610-8166 · Dental: 406-610-8161 · Behavioral health: 406-610-8171", "https://partnershiphealthcenter.org/contact/", "Call the appropriate line for medical, dental, behavioral-health, pharmacy, or insurance-assistance access and ask about appointments, cost, and sliding-fee documents."],
      ["AWARE Missoula", "Missoula and statewide program service areas", "406-532-8400", "https://www.aware-inc.org/location/missoula/", "Call for current mental-health, substance-use, developmental-disability, employment, case-management, or family services and confirm intake, insurance, cost, and availability."],
      ["Missoula Mobile Support Team", "City of Missoula and participating response area", "406-552-6210 · Request through 911 when needed", "https://www.missoulacounty.gov/topics/housing-safety-resources", "Call for non-law-enforcement behavioral-health response information or request the Mobile Support Team through 911; call 988 for crisis support and 911 for immediate danger."],
      ["YWCA Missoula", "Missoula County and surrounding service area", "24-hour crisis line: 1-800-483-7858 · 406-542-1944", "https://www.dojmt.gov/ovs-advocates/ywca-of-missoula/", "Call from a safe device if possible for confidential domestic-violence or sexual-assault support, safety planning, shelter, and advocacy; call 911 for immediate danger."],
      ["Missoula Job Service", "Missoula and surrounding labor market", "406-728-7060", "https://montanaworks.gov/job-service-montana/", "Contact the Missoula office for job search, résumé, unemployment-system navigation, training, or employer referrals and confirm current appointment or registration steps."],
      ["Missoula Lifelong Learning Center", "Missoula area", "406-549-8765", "https://www.missoulaclasses.com/hiset-and-ged-testing", "Contact the center to confirm HiSET or GED preparation and testing, adult-learning options, eligibility, waiver, registration, schedule, and cost."],
      ["Child Care Resources", "Missoula County and western Montana service region", "406-728-6446 · 1-800-728-6446", "https://dphhs.mt.gov/ecfsd/ChildCare/ChildCareResourceandReferral", "Ask for child-care referrals and Best Beginnings scholarship help, then confirm openings, licensing, hours, cost, eligibility, and wait lists with providers."],
      ["Mountain Line and ADA Paratransit", "Missoula fixed-route and ADA service area", "Bus: 406-721-3333 · Paratransit: 406-721-2848", "https://mountainline.com/your-trip/accessibility/", "Check routes or request paratransit or senior shuttle eligibility information and confirm certification, reservation notice, pickup area, accessibility, and service alerts."],
      ["Missoula Aging Services", "Missoula and Ravalli counties", "406-728-7682", "https://missoulaagingservices.org/get-help/talk-to-an-expert/call-us.html", "Call and describe the older or disabled person's location, daily-living needs, caregiver situation, transportation needs, and most urgent concern."],
      ["Missoula Animal Services", "City and County of Missoula", "406-541-7387", "https://missoulapublichealth.org/animals/contact-animal-services", "Review current animal-control, lost-pet, adoption, licensing, reclaim, surrender, and shelter instructions before visiting; call 911 if a person faces immediate danger."],
      ["Montana Veterans Affairs — Missoula Service Office", "Missoula region", "406-542-2501", "https://veterans.mt.gov/Veteran-Services/Veteran-Services-Program-Home", "Contact the service office for claims and benefits help and ask which discharge, identity, medical, income, and dependent records to bring."],
      ["Missoula County Smart911 Emergency Alerts", "Missoula County", "406-258-3631", "https://www.missoulacounty.gov/departments/office-of-emergency-management/", "Enroll in the official alert system, choose contact methods, keep the location current, and follow evacuation or protective instructions when issued."],
      ["National Weather Service Missoula", "Missoula County and western Montana forecast area", "", "https://www.weather.gov/mso/", "Check the current forecast, watches, warnings, air-quality, and fire-weather information for the correct community and follow local emergency instructions."],
      ["Missoula Public Library", "Missoula County branches and mobile services", "406-721-2665", "https://www.missoulapubliclibrary.org/home/about/contact-us/", "Choose a branch and confirm hours, card rules, computer and internet access, printing, classes, meeting spaces, and registration requirements."],
      ["United Way of Missoula County Volunteer Opportunities", "Missoula County", "406-549-6104", "https://missoulaunitedway.org/volunteer", "Review current volunteer requests and confirm the host, location, schedule, age, screening, orientation, waiver, and registration requirements before participating."]
    ]
  }
];

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`;
}

for (const place of places) {
  const rows = [...shared, ...place.local];
  if (rows.length !== 36) throw new Error(`${place.title}: expected 36 resources; found ${rows.length}.`);
  const lines = [
    csvCell(`Single Step Forward reviewer sheet — ${place.title}, Montana`),
    csvCell(`Source check date: ${checked}. Local reviewer confirmation is pending.`),
    csvCell("Please mark each row, correct anything stale, and add important missing resources. Do not include client or case details."),
    "",
    ["Resource", "Scope", "Phone", "Official link", "Current next step", "Still correct? (Yes/No)", "Correction or updated link", "Important missing resource", "Reviewer name", "Review date"].map(csvCell).join(","),
    ...rows.map((row) => [...row, "", "", "", "", ""].map(csvCell).join(","))
  ];
  fs.writeFileSync(path.join(root, "review-sheets", `${place.slug}-review.csv`), lines.join("\n") + "\n", "utf8");
}

console.log(`Created ${places.length} Montana reviewer sheets with ${shared.length + places[0].local.length} resources each.`);
