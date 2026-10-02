/**
 * AfyaAI USSD Server - Africa's Talking Integration
 * Production-ready Node.js/Express backend
 * Matches USSDTriageFlow.tsx frontend exactly
 */

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Load clinical decision tree
const clinicalRules = require('./clinical-decision-tree.json');

// Load SMS templates
const smsTemplates = require('./sms-templates.json');

// Database/storage (use your preferred DB)
const sessions = new Map(); // In production: Redis/MongoDB

/**
 * MAIN USSD ENDPOINT
 * Africa's Talking callback
 */
app.post('/ussd', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  console.log(`[USSD] Session: ${sessionId}, Phone: ${phoneNumber}, Input: ${text}`);
  
  // Get or create session
  let session = sessions.get(sessionId) || {
    sessionId,
    phoneNumber,
    language: null,
    reasonForUse: null,
    ageGroup: null,
    pregnancy: null,
    symptom: null,
    dangerSign: null,
    consciousness: null,
    timestamp: Date.now(),
  };
  
  const steps = text.split('*');
  const currentStep = steps.length - 1;
  const currentInput = steps[steps.length - 1];
  
  let response = '';
  let shouldEnd = false;
  
  try {
    // Screen 0: Language Selection
    if (text === '') {
      response = `CON Karibu AfyaAI.
Chagua lugha / Choose language:
1. Kiswahili
2. English`;
    }
    
    // Screen 1: Reason for Use
    else if (steps.length === 1) {
      session.language = currentInput === '1' ? 'sw' : 'en';
      
      if (session.language === 'sw') {
        response = `CON AfyaAI hukusaidia kuelewa dalili zako.

Unahitaji msaada gani leo?
1. Nina dalili / I have symptoms
2. Nina ujauzito / Pregnancy
3. Mtoto anaumwa / Child is sick
4. Dawa au matokeo / Meds or results
5. Dharura / Emergency`;
      } else {
        response = `CON AfyaAI helps you understand your health.

What do you need help with?
1. I have symptoms
2. Pregnancy
3. Child is sick
4. Meds or results
5. Emergency`;
      }
    }
    
    // Emergency Shortcut
    else if (steps.length === 2 && currentInput === '5') {
      session.reasonForUse = 'emergency';
      
      if (session.language === 'sw') {
        response = `END Ikiwa kuna hatari ya maisha:
• Piga 112 sasa
• Nenda hospitali ya karibu

AfyaAI haibadilishi daktari.`;
      } else {
        response = `END If life-threatening:
• Call 112 now
• Go to nearest hospital

AfyaAI does not replace a doctor.`;
      }
      
      shouldEnd = true;
      await logSession(session, 'emergency_shortcut');
    }
    
    // Screen 2: Age Group
    else if (steps.length === 2) {
      session.reasonForUse = currentInput;
      
      if (session.language === 'sw') {
        response = `CON Tafadhali chagua umri wa mgonjwa:
1. Chini ya miaka 5
2. Miaka 5-17
3. Miaka 18-49
4. Miaka 50+`;
      } else {
        response = `CON Select age:
1. Under 5
2. 5-17
3. 18-49
4. 50+`;
      }
    }
    
    // Screen 3: Pregnancy Check (Conditional)
    else if (steps.length === 3) {
      session.ageGroup = currentInput;
      
      // Only ask pregnancy if age 18-49
      if (currentInput === '3') {
        if (session.language === 'sw') {
          response = `CON Je, una ujauzito?
1. Ndiyo
2. Hapana`;
        } else {
          response = `CON Are you pregnant?
1. Yes
2. No`;
        }
      } else {
        // Skip to symptoms
        if (session.language === 'sw') {
          response = `CON Dalili kuu ni ipi?
1. Homa
2. Kikohozi / Kupumua kwa shida
3. Maumivu makali
4. Kuhara au kutapika
5. Kutokwa damu
6. Nyingine`;
        } else {
          response = `CON Main symptom:
1. Fever
2. Cough / breathing trouble
3. Severe pain
4. Diarrhea or vomiting
5. Bleeding
6. Other`;
        }
      }
    }
    
    // Screen 4: Main Symptom (after pregnancy or directly)
    else if (steps.length === 4) {
      // Check if previous was pregnancy question
      if (session.ageGroup === '3' && !session.pregnancy) {
        session.pregnancy = currentInput === '1';
      }
      
      if (session.language === 'sw') {
        response = `CON Dalili kuu ni ipi?
1. Homa
2. Kikohozi / Kupumua kwa shida
3. Maumivu makali
4. Kuhara au kutapika
5. Kutokwa damu
6. Nyingine`;
      } else {
        response = `CON Main symptom:
1. Fever
2. Cough / breathing trouble
3. Severe pain
4. Diarrhea or vomiting
5. Bleeding
6. Other`;
      }
    }
    
    // Screen 5: Danger Sign (Adaptive)
    else if (steps.length === 5) {
      session.symptom = currentInput;
      
      // Adaptive questions based on symptom
      if (currentInput === '1') { // Fever
        if (session.language === 'sw') {
          response = `CON Homa imechukua siku ngapi?
1. Chini ya siku 2
2. Siku 2-3
3. Zaidi ya siku 3`;
        } else {
          response = `CON How long have you had fever?
1. Less than 2 days
2. 2-3 days
3. More than 3 days`;
        }
      } else if (currentInput === '2') { // Breathing
        if (session.language === 'sw') {
          response = `CON Je, unapumua kwa shida?
1. Ndiyo, sana
2. Ndiyo, kidogo
3. Hapana`;
        } else {
          response = `CON Is breathing difficult?
1. Yes, very
2. Yes, a little
3. No`;
        }
      } else if (currentInput === '5') { // Bleeding
        if (session.language === 'sw') {
          response = `CON Kutokwa damu ni:
1. Kidogo
2. Kingi`;
        } else {
          response = `CON Bleeding is:
1. Light
2. Heavy`;
        }
      } else { // Other symptoms
        if (session.language === 'sw') {
          response = `CON Dalili ni kali?
1. Ndiyo, sana
2. Wastani
3. Kidogo`;
        } else {
          response = `CON How severe?
1. Very severe
2. Moderate
3. Mild`;
        }
      }
    }
    
    // Screen 6: Consciousness Check
    else if (steps.length === 6) {
      session.dangerSign = currentInput;
      
      if (session.language === 'sw') {
        response = `CON Je, mgonjwa:
1. Yuko macho na anaongea
2. Ana usingizi mwingi / amechanganyikiwa
3. Hana fahamu`;
      } else {
        response = `CON Patient condition:
1. Awake and talking
2. Very sleepy / confused
3. Unconscious`;
      }
    }
    
    // Final: Compute Risk and Send Results
    else if (steps.length === 7) {
      session.consciousness = currentInput;
      
      // Compute risk level
      const assessment = computeRiskLevel(session, clinicalRules);
      session.riskLevel = assessment.riskLevel;
      session.recommendation = assessment.recommendation;
      session.facility = assessment.facility;
      session.referralCode = generateReferralCode(assessment.riskLevel);
      session.facilityHfrId = assessment.facilityHfrId;
      
      // Build response
      const result = buildResultMessage(session, assessment, session.language);
      response = `END ${result}`;
      
      shouldEnd = true;
      
      // Log session
      await logSession(session, 'completed');
      
      // Send SMS
      await sendSMS(session, assessment);
    }
    
    // Save session
    sessions.set(sessionId, session);
    
  } catch (error) {
    console.error('[USSD Error]', error);
    
    if (session.language === 'sw') {
      response = `END Samahani, kuna tatizo. Tafadhali jaribu tena.`;
    } else {
      response = `END Sorry, there was an error. Please try again.`;
    }
  }
  
  // Set response type
  res.set('Content-Type', 'text/plain');
  res.send(response);
  
  // Clean up session after end
  if (shouldEnd) {
    setTimeout(() => sessions.delete(sessionId), 300000); // Keep for 5 min
  }
});

/**
 * COMPUTE RISK LEVEL
 * Based on clinical decision tree
 */
function computeRiskLevel(session, rules) {
  const { ageGroup, pregnancy, symptom, dangerSign, consciousness } = session;
  
  // HIGH RISK CONDITIONS
  const isChildUnder5 = ageGroup === '1';
  const isFever = symptom === '1';
  const feverLong = dangerSign === '3'; // >3 days
  const breathingSevere = symptom === '2' && dangerSign === '1';
  const bleedingHeavy = symptom === '5' && dangerSign === '2';
  const unconscious = consciousness === '3';
  const severePain = symptom === '3' && dangerSign === '1';
  
  if (
    (isChildUnder5 && isFever && feverLong) ||
    (pregnancy && symptom === '5') || // Bleeding
    (pregnancy && severePain) ||
    breathingSevere ||
    unconscious ||
    bleedingHeavy
  ) {
    return {
      riskLevel: 'HIGH',
      recommendation: 'EMERGENCY',
      facility: session.language === 'sw' 
        ? 'Hospitali ya Rufaa Muhimbili' 
        : 'Muhimbili National Hospital',
      facilityHfrId: 'HFR-001234',
    };
  }
  
  // MEDIUM RISK CONDITIONS
  const feverModerate = isFever && dangerSign === '2'; // 2-3 days
  const diarrheaWeak = symptom === '4' && consciousness === '2';
  
  if (feverModerate || severePain || diarrheaWeak) {
    return {
      riskLevel: 'MEDIUM',
      recommendation: 'VISIT_CLINIC',
      facility: session.language === 'sw' 
        ? 'Kituo cha Afya Kariakoo' 
        : 'Kariakoo Health Centre',
      facilityHfrId: 'HFR-005678',
    };
  }
  
  // LOW RISK (Default)
  return {
    riskLevel: 'LOW',
    recommendation: 'SELF_CARE',
    facility: session.language === 'sw' 
      ? 'Kituo cha Afya Kariakoo' 
      : 'Kariakoo Health Centre',
    facilityHfrId: 'HFR-005678',
  };
}

/**
 * GENERATE REFERRAL CODE
 */
function generateReferralCode(riskLevel) {
  const prefix = riskLevel === 'HIGH' ? '8' : riskLevel === 'MEDIUM' ? '2' : '1';
  const random = Math.floor(100 + Math.random() * 900);
  return `AFYA-${prefix}${random}`;
}

/**
 * BUILD RESULT MESSAGE
 */
function buildResultMessage(session, assessment, language) {
  const { riskLevel, facility, recommendation } = assessment;
  const { referralCode } = session;
  
  if (language === 'sw') {
    if (riskLevel === 'HIGH') {
      return `🔴 HII NI DHARURA

Tafadhali nenda HARAKA kwenye:
${facility}

Au piga 112 sasa.

Rejea: ${referralCode}
Tunakutumia SMS ya maelekezo.`;
    } else if (riskLevel === 'MEDIUM') {
      return `🟡 DALILI ZINAHITAJI KUANGALIWA

Dalili zako zinahitaji kuangaliwa na mhudumu wa afya.

Tafadhali tembelea:
${facility}

Leo au kesho.

Rejea: ${referralCode}
Utapokea SMS ya uthibitisho.`;
    } else {
      return `🟢 DALILI ZA KAWAIDA

Dalili zako zinaonekana kuwa si hatari kwa sasa.

Ushauri:
• Pumzika
• Kunywa maji mengi
• Fuatilia dalili

Ikiwa hazitapungua, tembelea kituo cha afya.

Kituo cha karibu: ${facility}
Rejea: ${referralCode}`;
    }
  } else {
    if (riskLevel === 'HIGH') {
      return `🔴 THIS IS AN EMERGENCY

Please go IMMEDIATELY to:
${facility}

Or call 112 now.

Ref: ${referralCode}
We are sending you an SMS with instructions.`;
    } else if (riskLevel === 'MEDIUM') {
      return `🟡 SYMPTOMS NEED ATTENTION

Your symptoms need to be checked by a health worker.

Please visit:
${facility}

Today or tomorrow.

Ref: ${referralCode}
You will receive a confirmation SMS.`;
    } else {
      return `🟢 LOW RISK

Your symptoms appear mild for now.

Advice:
• Rest
• Drink plenty of water
• Monitor symptoms

If they don't improve, visit a health facility.

Nearest facility: ${facility}
Ref: ${referralCode}`;
    }
  }
}

/**
 * SEND SMS CONFIRMATION
 * Using Africa's Talking SMS API
 */
async function sendSMS(session, assessment) {
  const { phoneNumber, language, referralCode, facility, riskLevel } = session;
  
  try {
    const message = smsTemplates[riskLevel][language]
      .replace('{facility}', facility)
      .replace('{code}', referralCode);
    
    // Africa's Talking SMS API
    const response = await axios.post(
      'https://api.africastalking.com/version1/messaging',
      {
        username: process.env.AT_USERNAME,
        to: phoneNumber,
        message: message,
        from: 'AfyaAI',
      },
      {
        headers: {
          'apiKey': process.env.AT_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    console.log('[SMS Sent]', phoneNumber, referralCode);
    return response.data;
  } catch (error) {
    console.error('[SMS Error]', error.message);
  }
}

/**
 * LOG SESSION TO DATABASE
 */
async function logSession(session, status) {
  const logData = {
    session_id: session.sessionId,
    phone_number_hash: hashPhoneNumber(session.phoneNumber), // Privacy
    language: session.language,
    reason_for_use: session.reasonForUse,
    age_group: session.ageGroup,
    pregnancy: session.pregnancy,
    symptom: session.symptom,
    danger_sign: session.dangerSign,
    consciousness: session.consciousness,
    risk_level: session.riskLevel,
    recommendation: session.recommendation,
    referral_code: session.referralCode,
    facility_hfr_id: session.facilityHfrId,
    duration_seconds: Math.floor((Date.now() - session.timestamp) / 1000),
    status: status,
    timestamp: new Date().toISOString(),
  };
  
  // Save to database (MongoDB, PostgreSQL, etc.)
  console.log('[Session Log]', logData);
  
  // TODO: Insert into your database
  // await db.collection('ussd_sessions').insertOne(logData);
}

/**
 * HASH PHONE NUMBER (Privacy)
 */
function hashPhoneNumber(phoneNumber) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(phoneNumber).digest('hex');
}

/**
 * HEALTH CHECK ENDPOINT
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AfyaAI USSD Server',
    version: '1.0.0',
    active_sessions: sessions.size,
  });
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[AfyaAI USSD Server] Running on port ${PORT}`);
  console.log(`[Callback URL] https://yourdomain.com/ussd`);
});

module.exports = app;
