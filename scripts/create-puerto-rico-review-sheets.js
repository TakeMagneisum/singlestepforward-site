#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const checked = "November 4, 2026";

const shared = [
  ["2-1-1 de Puerto Rico", "Puerto Rico", "211", "https://www.211pr.org/", "Call 211 or search by municipality and topic for current services; confirm service area, intake, and availability directly."],
  ["311 — Familia en Contacto", "Puerto Rico", "311", "https://www.familia.pr.gov/", "Call 311 for Department of the Family program navigation and confirm the correct local office, eligibility process, and documents."],
  ["Programa de Asistencia Nutricional (PAN)", "Puerto Rico", "311", "https://serviciosenlinea.adsef.pr.gov/programas/programa-asistencia-nutricional-pan", "Apply online or through the nearest Department of the Family office and save the confirmation; eligibility is determined by ADSEF."],
  ["Programa TANF de Puerto Rico", "Puerto Rico", "311", "https://www.familia.pr.gov/", "Contact Familia en Contacto or the local office to review current cash-assistance eligibility, documents, and application steps."],
  ["Programa WIC Puerto Rico", "Puerto Rico", "", "https://wic.pr.gov/", "Review eligibility for pregnant or postpartum people, infants, and children under five, then contact the appropriate clinic for an appointment."],
  ["Plan Vital — Medicaid Puerto Rico", "Puerto Rico", "1-800-981-2737", "https://www.planvitalpr.com/", "Review eligibility and enrollment information, then confirm the assigned insurer, primary provider, effective date, and required documents."],
  ["Departamento de Salud de Puerto Rico", "Puerto Rico", "787-765-2929", "https://www.salud.pr.gov/", "Use the official program directory for public-health, vaccination, clinic, and prevention information; call before traveling."],
  ["Línea PAS de ASSMCA", "Puerto Rico", "988 · 1-800-981-0023 · VRS 787-615-4112", "https://assmca.pr.gov/linea-pas", "Call 988 or Línea PAS for free 24-hour crisis, mental-health, or substance-use support; call 911 for immediate physical danger."],
  ["Sistema de Emergencias 9-1-1", "Puerto Rico", "911", "https://www.911.pr.gov/", "Call 911 for an active emergency, serious injury, fire, crime in progress, or immediate threat; give the exact location."],
  ["Oficina de la Procuradora de las Mujeres", "Puerto Rico", "787-722-2977", "https://mujer.pr.gov/", "Contact the office or its listed crisis resources from a safe device for orientation and support; call 911 for immediate danger."],
  ["Servicios Legales de Puerto Rico", "Puerto Rico", "787-728-5070 · 1-800-981-5342 · TTY 711", "https://www.servicioslegales.org/solicite/", "Complete the eligibility intake online or by phone for a civil legal matter; applying does not guarantee representation."],
  ["Poder Judicial — Servicios legales gratuitos", "Puerto Rico", "", "https://poderjudicial.pr/servicios-legales-gratuitos/", "Use the official directory to identify a legal-help provider for the issue and confirm its intake, eligibility, deadlines, and scope."],
  ["Departamento de Asuntos del Consumidor (DACO)", "Puerto Rico", "787-722-7555", "https://www.daco.pr.gov/", "Review consumer guidance or complaint procedures and keep contracts, receipts, notices, and prior communications."],
  ["Administración de Vivienda Pública", "Puerto Rico", "787-759-9407", "https://www.avp.pr.gov/", "Check current public-housing and voucher application status; confirm openings, preferences, documents, and deadlines before applying."],
  ["Programa de Subsidio y Crisis de Energía (LIHEAP)", "Puerto Rico", "311", "https://serviciosenlinea.adsef.pr.gov/programas/programa-de-subsidio-y-crisis-de-energia", "Confirm whether the annual application period or crisis assistance is active and ask the local office which documents are required."],
  ["Departamento del Trabajo — Empleo y Reempleo", "Puerto Rico", "", "https://www.trabajo.pr.gov/empleo_reempleo.asp", "Contact the employment service for registration, job referrals, counseling, or reemployment support and confirm the nearest office."],
  ["PERFIL — Portal de Empleo de Puerto Rico", "Puerto Rico", "", "https://www.trabajo.pr.gov/perfil.asp", "Create a profile, upload a résumé only through the official portal, and verify each employer and application instruction."],
  ["Administración de Rehabilitación Vocacional", "Puerto Rico", "787-729-0160", "https://arv.pr.gov/", "Contact the agency to request orientation and confirm disability-related vocational eligibility, assessment, and documentation."],
  ["Defensoría de las Personas con Impedimentos", "Puerto Rico", "787-725-2333", "https://www.dpi.pr.gov/", "Contact the office for disability-rights orientation or complaints and document the barrier, date, organization, and prior response."],
  ["Oficina del Procurador de las Personas de Edad Avanzada", "Puerto Rico", "787-721-6121", "https://www.oppea.pr.gov/", "Review services for adults age 60 or older and contact the office to confirm the appropriate program, referral, or legal orientation."],
  ["VA Caribbean Healthcare System", "Puerto Rico and U.S. Virgin Islands", "787-641-7582", "https://www.va.gov/caribbean-health-care/", "Contact VA Caribbean for health-care enrollment, appointments, benefits navigation, or the correct veteran service office."],
  ["IRS Free Tax Preparation — VITA/TCE", "United States and Puerto Rico", "800-906-9887", "https://www.irs.gov/individuals/free-tax-return-preparation-for-qualifying-taxpayers", "Use the official locator during filing season, then call the site to confirm dates, language support, eligibility, and required documents."],
  ["Hacienda — SURI", "Puerto Rico", "787-622-0123", "https://suri.hacienda.pr.gov/", "Use the official tax portal for filings, payments, and correspondence; verify the correct form and deadline before submitting."],
  ["Negociado para el Manejo de Emergencias y Administración de Desastres", "Puerto Rico", "787-724-0124", "https://manejodeemergencias.pr.gov/", "Check official preparedness and emergency updates and follow evacuation or safety instructions from territorial and municipal authorities."],
  ["National Weather Service San Juan", "Puerto Rico and U.S. Virgin Islands", "", "https://www.weather.gov/sju/", "Check the official forecast, watches, and warnings for the correct municipality and follow emergency-management instructions."],
  ["Autoridad de Transporte Integrado (ATI)", "Puerto Rico", "", "https://www.ati.pr.gov/", "Review official routes, fares, accessibility, and service alerts for the relevant transit mode before traveling."],
  ["Departamento de Educación de Puerto Rico", "Puerto Rico", "787-759-2000", "https://de.pr.gov/", "Use the official portal for schools, adult education, student services, and program contacts; confirm enrollment requirements directly."],
  ["AmeriCorps Puerto Rico", "Puerto Rico", "", "https://www.americorps.gov/contact/americorps-regional-offices/puerto-rico", "Review current service opportunities and eligibility, then apply only through the official listing or designated organization."],
  ["Departamento de Salud — Salud Ambiental y Rabia", "Puerto Rico", "787-765-2929", "https://www.salud.pr.gov/", "Contact the Department of Health or municipality for current animal-bite, rabies, vaccination, and public-health instructions."],
  ["FEMA Disaster Assistance", "Puerto Rico", "1-800-621-3362", "https://www.disasterassistance.gov/", "After a federally declared disaster, check whether applications are open, apply through the official portal, and save the confirmation number."],
];

const places = [
  { slug:"san-juan-pr", title:"San Juan", local:[
    ["San Juan — Desarrollo Social Comunitario", "Municipality of San Juan", "787-480-4251", "https://sanjuan.pr/directorio/Sk94WDZCSHhnNDZodk5sUFFJTjA5QT09/detalle", "Contact the department or mobile service unit to identify the correct municipal social program and confirm residency and documents."],
    ["Conexión Laboral Área Local San Juan", "Municipality of San Juan", "", "https://sanjuan.pr/servicios/cHYzSzZIT05DakFSQkdwejZ6Q1NGUT09", "Use the municipal employment center for current vacancies, training, youth services, or employer referrals and confirm intake."],
    ["Portal de Trámites de San Juan", "Municipality of San Juan", "", "https://tramite.sanjuan.pr/", "Create an account only if needed for a municipal transaction, choose the exact service, and retain the submission receipt."],
    ["San Juan Va Por Ti", "Municipality of San Juan", "", "https://www.sanjuan.pr/", "Review the municipal emergency registry for residents with special needs and confirm enrollment requirements directly."],
    ["San Juan — Vales de Vivienda Temporera", "Municipality of San Juan", "", "https://sanjuan.pr/directorio/Sk94WDZCSHhnNDZodk5sUFFJTjA5QT09/detalle", "Contact municipal social services for assessment; temporary housing is limited and placement is not guaranteed."],
    ["San Juan AIDS Task Force", "Municipality of San Juan", "", "https://www.sanjuan.pr/", "Use the municipal service link to confirm current HIV testing, care, eligibility, appointment, and confidentiality procedures."]
  ]},
  { slug:"bayamon-pr", title:"Bayamón", local:[
    ["Bayamón — Oficina de Ayuda al Ciudadano", "Municipality of Bayamón", "", "https://www.municipiodebayamon.com/servicios-municipales/familia/oficina-de-ayuda-al-ciudadano/", "Contact the office for assessment and orientation; confirm residency, income evidence, documents, and whether assistance is currently available."],
    ["Bayamón — Servicios de Salud", "Municipality of Bayamón", "", "https://www.municipiodebayamon.com/servicios-municipales/salud/", "Choose the appropriate municipal health program and call to confirm clinic schedule, eligibility, appointments, and documents."],
    ["Bayamón — Departamento del Trabajo Municipal", "Municipality of Bayamón", "", "https://www.municipiodebayamon.com/servicios-municipales/empleos/office-1209640_1920/", "Review municipal employment programs and confirm current registration, vacancies, training, and appointment requirements."],
    ["Bayamón — Departamento de Transportación", "Municipality of Bayamón", "787-740-5690", "https://www.municipiodebayamon.com/servicios-municipales/transportacion/", "Check current municipal routes, eligibility, schedules, accessibility, and reservation requirements before relying on a trip."],
    ["Bayamón — Servicios de Vivienda", "Municipality of Bayamón", "", "https://www.municipiodebayamon.com/servicios-municipales/vivienda/", "Review current municipal housing programs and confirm funding, waitlists, residency, deadlines, and required documents."],
    ["Bayamón — Servicios para Personas con Impedimentos", "Municipality of Bayamón", "", "https://www.municipiodebayamon.com/servicios-municipales/familia/oficina-de-ayuda-al-ciudadano/", "Ask the citizen-assistance office for the disability-services unit and confirm current accommodations, referrals, and documentation."]
  ]},
  { slug:"carolina-pr", title:"Carolina", local:[
    ["Carolina — Programa de Bienestar Social", "Municipality of Carolina", "787-757-2626 ext. 8395 or 8292", "https://www.municipiocarolina.com/servicios-al-ciudadano/", "Contact the program for social assessment and confirm residency, income evidence, documents, and current emergency assistance."],
    ["Viva Carolina", "Municipality of Carolina", "787-220-6438 · 787-643-1083", "https://www.municipiocarolina.com/viva-carolina/", "Check the mobile-unit schedule or call to request orientation about community social, health, employment, or education services."],
    ["Conexión Laboral Carolina", "Municipality of Carolina", "", "https://www.municipiocarolina.com/conexion-laboral/", "Contact the career center for job-search assistance, training, accessible technology, or referrals and confirm current enrollment."],
    ["Mi Techo Seguro — Carolina", "Municipality of Carolina", "787-776-2105", "https://www.municipiocarolina.com/servicios-al-ciudadano/", "Call for assessment of transitional-housing services; eligibility and placement are limited and not guaranteed."],
    ["Proyecto Llave — Carolina", "Municipality of Carolina", "787-757-2626 ext. 4403 or 4406", "https://www.municipiocarolina.com/servicios-al-ciudadano/", "Contact the program to confirm substance-use recovery eligibility, referral requirements, schedule, and available services."],
    ["Carolina — Departamento de Servicio al Ciudadano", "Municipality of Carolina", "787-757-2626 ext. 8413", "https://www.municipiocarolina.com/directorio-municipal/", "Call the municipal directory contact to identify the correct office and confirm current hours, location, and intake requirements."]
  ]},
  { slug:"ponce-pr", title:"Ponce", local:[
    ["Municipio Autónomo de Ponce — Orientación de Servicios", "Municipality of Ponce", "787-284-4141", "https://ciudadponce.com/", "Contact the municipality to identify the correct department and confirm current hours, residency rules, documents, and intake."],
    ["Ponce — Departamento de Salud y Bienestar", "Municipality of Ponce", "787-284-4141", "https://ciudadponce.com/ova_sev/salud-ambiental/", "Call to confirm current vaccination, prevention, clinic, or referral services and any appointment or document requirements."],
    ["Ponce Jobs", "Municipality of Ponce", "", "https://p11map.com/p11jobs", "Use the municipal employment platform to review openings or create a candidate profile; verify employers before sharing documents."],
    ["AVP — Oficina Regional de Ponce", "Ponce service region", "787-759-9407 ext. 3808–3822", "https://portal.avp.pr.gov/oficinas-regionales", "Contact the regional office to confirm current public-housing or voucher status, service area, appointments, and documents."],
    ["Ponce Neighborhood Housing Services", "Ponce region", "787-841-5055", "https://www.poncenhs.org/en/proceso-alquiler", "Request housing counseling and confirm services, language, appointments, fees if any, and documents before attending."],
    ["SITRAS Ponce", "Municipality of Ponce", "", "https://ciudadponce.com/", "Use the municipal transportation link or contact the city to confirm current routes, schedules, fares, stops, and accessibility."]
  ]}
];

function cell(value){ return `"${String(value ?? "").replace(/"/g,'""').replace(/[\r\n]+/g," ")}"`; }
for(const place of places){
  const rows=[...shared,...place.local];
  const lines=[cell(`Single Step Forward reviewer sheet — ${place.title}, Puerto Rico`),cell(`Source check date: ${checked}. Local reviewer confirmation is pending.`),cell("Please mark each row, correct anything stale, and add important missing resources. Do not include client or case details."),"",["Resource","Scope","Phone","Official link","Current next step","Still correct? (Yes/No)","Correction or updated link","Important missing resource","Reviewer name","Review date"].map(cell).join(","),...rows.map(r=>[...r,"","","","",""] .map(cell).join(","))];
  fs.writeFileSync(path.join(root,"review-sheets",`${place.slug}-review.csv`),lines.join("\n")+"\n","utf8");
}
console.log(`Created ${places.length} Puerto Rico reviewer sheets with ${shared.length+places[0].local.length} resources each.`);
