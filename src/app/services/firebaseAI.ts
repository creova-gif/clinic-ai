
export async function generateTriage(data: any): Promise<any> {
  return {
    level: 'moderate',
    confidence: 'medium',
    recommendation: 'Please consult a doctor.',
    reasoning: ['Based on symptoms'],
    redFlags: [],
    escalationRequired: false,
    callEmergency: false
  };
}

export async function getChatModel() { return {}; }
export async function getDispatchModel() { return {}; }
