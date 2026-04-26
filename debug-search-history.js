// Debug search history functionality
console.log('=== Search History Debug ===');

// Test 1: Check if localStorage has any data
console.log('1. Checking localStorage...');
const searchHistoryData = localStorage.getItem('searchHistory');
console.log('searchHistory in localStorage:', searchHistoryData);

// Test 2: Try to add a test item directly
console.log('2. Adding test item...');
try {
  const testItem = {
    id: Date.now().toString(),
    query: 'Debug Test Item',
    timestamp: new Date(),
    response: 'This is a test response',
    category: 'general'
  };
  
  let currentHistory = [];
  if (searchHistoryData) {
    currentHistory = JSON.parse(searchHistoryData);
  }
  
  currentHistory.unshift(testItem);
  localStorage.setItem('searchHistory', JSON.stringify(currentHistory));
  console.log('Test item added successfully');
  
  // Test 3: Verify it was saved
  const updatedData = localStorage.getItem('searchHistory');
  const parsedData = JSON.parse(updatedData);
  console.log('3. Verification - History now has', parsedData.length, 'items');
  console.log('First item:', parsedData[0]);
  
} catch (error) {
  console.error('Error adding test item:', error);
}

// Test 4: Check if global function exists
console.log('4. Checking global function...');
console.log('window.addToSearchHistory exists:', typeof window.addToSearchHistory);

// Test 5: Try using global function
if (typeof window.addToSearchHistory === 'function') {
  console.log('5. Testing global function...');
  window.addToSearchHistory('Global Test Query', 'Global Test Response');
  
  const finalData = localStorage.getItem('searchHistory');
  const finalParsed = JSON.parse(finalData);
  console.log('After global function call, history has', finalParsed.length, 'items');
} else {
  console.log('5. Global function not available');
}

console.log('=== Debug Complete ===');
