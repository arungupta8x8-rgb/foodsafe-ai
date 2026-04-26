// Test Grok API Integration
import { analyzeFoodWithGrok } from './src/utils/grok.js';

// Test user profile
const testUserProfile = {
  allergies: ['peanuts', 'milk'],
  severity: {
    peanuts: 'high',
    milk: 'medium'
  }
};

// Test food ingredients
const testIngredients = "peanut butter, wheat flour, milk, sugar, salt";

async function testGrokAPI() {
  console.log('🚀 Testing Grok API integration...');
  console.log('📝 Test ingredients:', testIngredients);
  console.log('👤 User profile:', testUserProfile);
  
  try {
    const result = await analyzeFoodWithGrok(testIngredients, testUserProfile);
    
    console.log('\n✅ Grok API Test Successful!');
    console.log('📊 Analysis Results:');
    console.log('- Food:', result.food);
    console.log('- Allergens detected:', result.allergens);
    console.log('- Risk level:', result.riskLevel);
    console.log('- Explanation:', result.explanation);
    console.log('- Safe alternatives:', result.safeAlternatives);
    console.log('- Ingredients found:', result.ingredients);
    
    return result;
  } catch (error) {
    console.error('❌ Grok API Test Failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 Possible issue: Invalid API key');
    } else if (error.message.includes('429')) {
      console.log('💡 Possible issue: Rate limit exceeded');
    } else if (error.message.includes('403')) {
      console.log('💡 Possible issue: Access denied or account not approved');
    }
    
    return null;
  }
}

// Run the test
testGrokAPI().then(result => {
  if (result) {
    console.log('\n🎉 Grok integration is working correctly!');
  } else {
    console.log('\n⚠️  Please check your API key and xAI account status.');
  }
});
