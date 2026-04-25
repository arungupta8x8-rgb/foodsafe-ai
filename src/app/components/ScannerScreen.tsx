import { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Type, Barcode, ArrowLeft, Sparkles, Upload } from 'lucide-react';
import type { ScanResult, UserProfile } from '../App';
import { analyzeFoodWithGemini } from '../../utils/gemini-new';
import { GEMINI_API_KEY } from '../../utils/gemini-new';

interface ScannerScreenProps {
  onBack: () => void;
  onScan: (result: ScanResult) => void;
  userProfile: UserProfile;
}

export function ScannerScreen({ onBack, onScan, userProfile }: ScannerScreenProps) {
  const [scanMode, setScanMode] = useState<'text' | 'image' | 'barcode' | null>(null);
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleTextScan = async () => {
    if (!inputText.trim()) return;

    setIsScanning(true);

    try {
      // Use Gemini API for real AI analysis
      const result = await analyzeFoodWithGemini(inputText, userProfile);
      setIsScanning(false);
      onScan(result);
    } catch (error) {
      console.error('Gemini analysis error:', error);
      setIsScanning(false);
      // Show error to user
      alert('AI analysis failed. Please try again.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      alert("Image too large. Please upload smaller image (max 4MB).");
      return;
    }

    setIsScanning(true);

    try {
      // Convert image to base64 for Gemini API
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (event) => {
        try {
          const base64Image = event.target?.result as string;
          
          // Validate base64 format
          if (!base64Image.includes(',')) {
            throw new Error("Invalid image format");
          }
          
          // Use Gemini API for image analysis
          const prompt = `
          Analyze this food image for ingredients and potential allergens.
          
          User's known allergies: ${userProfile.allergies.join(', ')}
          User's allergy severity levels: ${JSON.stringify(userProfile.severity)}
          
          Please extract all visible text/ingredients from this image and analyze for:
          1. Common allergens: peanuts, tree nuts, milk, eggs, fish, shellfish, soy, wheat, sesame
          2. Risk assessment based on user's allergy profile
          3. Safety explanation
          4. Safe alternatives if needed
          
          IMPORTANT: Return ONLY raw JSON. Do not use markdown or backticks. Keep explanations brief (under 100 characters). No extra text or explanations.
          Format: {"detected_allergens": ["allergen1", "allergen2"], "risk_level": "low|medium|high", "explanation": "brief safety explanation", "safe_alternatives": ["alternative1", "alternative2"], "ingredients": ["ingredient1", "ingredient2", "ingredient3"]}
        `;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [
                  {
                    inline_data: {
                      mime_type: file.type,
                      data: base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix
                    }
                  },
                  {
                    text: prompt
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1000,
              }
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Gemini image analysis failed');
        }

        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error('No response from Gemini API');
        }

        // Parse the JSON response from Gemini safely
        const rawText = data.candidates[0].content.parts[0].text;
        
        // Step 1: Remove markdown (```json ... ```)
        let cleanedText = rawText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        // Step 2: Handle incomplete JSON responses
        let jsonToParse = cleanedText;
        
        // Check if JSON is incomplete (missing closing brace)
        if (cleanedText.startsWith('{') && !cleanedText.endsWith('}')) {
          // Try to find the last complete JSON object
          const braceCount = (cleanedText.match(/\{/g) || []).length;
          const closeBraceCount = (cleanedText.match(/\}/g) || []).length;
          
          if (braceCount > closeBraceCount) {
            // Add missing closing braces
            const missingBraces = braceCount - closeBraceCount;
            jsonToParse = cleanedText + '}'.repeat(missingBraces);
          }
        }
        
        // Step 3: Extract JSON safely
        const jsonMatch = jsonToParse.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
          console.error("RAW RESPONSE:", rawText);
          console.error("CLEANED TEXT:", cleanedText);
          throw new Error("No JSON found in response");
        }
        
        // Step 4: Parse with fallback
        let aiResponse;
        try {
          aiResponse = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("PARSE ERROR:", jsonMatch[0]);
          // Fallback: try to manually parse partial JSON
          try {
            const partialJson = jsonMatch[0].replace(/,[\s]*$/, ''); // Remove trailing comma
            aiResponse = JSON.parse(partialJson);
          } catch (e2) {
            console.error("FALLBACK PARSE FAILED:", e2);
            throw new Error("Invalid JSON format");
          }
        }
        
        const result = {
          food: 'Analyzed food from image',
          allergens: aiResponse.detected_allergens || [],
          riskLevel: aiResponse.risk_level || 'low',
          explanation: aiResponse.explanation || 'AI analysis completed',
          safeAlternatives: aiResponse.safe_alternatives || [],
          ingredients: aiResponse.ingredients || [],
        };

        setIsScanning(false);
        onScan(result);
      } catch (error) {
        console.error("🔥 ONLOAD ERROR:", error);
        setIsScanning(false);
        alert("Image processing failed. Check console.");
      } finally {
        // Always ensure scanning state is reset
        setIsScanning(false);
      }
    };
  } catch (error) {
      console.error('Image analysis error:', error);
      setIsScanning(false);
      // Show user-friendly error instead of alert
      alert(`Image analysis failed: ${(error as Error)?.message || 'Unknown error'}. Please try again.`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="size-10 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="size-5" />
        </motion.button>
        <div>
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
            Food Scanner
          </h1>
          <p className="text-sm text-muted-foreground">Choose your scanning method</p>
        </div>
      </div>

      {/* Scanning modes */}
      {!scanMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScanMode('image')}
            className="group bg-card border border-border rounded-2xl p-8 hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="size-8 text-white" />
            </div>
            <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Scan Image
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload or capture ingredient labels
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScanMode('text')}
            className="group bg-card border border-border rounded-2xl p-8 hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Type className="size-8 text-white" />
            </div>
            <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Type Text
            </h3>
            <p className="text-sm text-muted-foreground">
              Enter ingredients manually
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScanMode('barcode')}
            className="group bg-card border border-border rounded-2xl p-8 hover:border-primary hover:shadow-lg transition-all"
          >
            <div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-chart-3 to-chart-3/80 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Barcode className="size-8 text-white" />
            </div>
            <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Scan Barcode
            </h3>
            <p className="text-sm text-muted-foreground">
              Look up product by barcode
            </p>
          </motion.button>
        </motion.div>
      )}

      {/* Text input mode */}
      {scanMode === 'text' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-card border border-border rounded-2xl p-6">
            <label className="block mb-3">
              Enter ingredients or food name
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., Wheat flour, milk, eggs, peanuts, soy lecithin..."
              className="w-full h-32 px-4 py-3 bg-input-background border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTextScan}
                disabled={!inputText.trim() || isScanning}
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="size-5" />
                    </motion.div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    <span>Analyze with AI</span>
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setScanMode(null)}
                className="px-6 py-3 rounded-xl bg-muted hover:bg-accent transition-colors"
              >
                Back
              </motion.button>
            </div>
          </div>

          {/* Example inputs */}
          <div className="bg-muted/50 rounded-2xl p-6">
            <h4 className="mb-3">Try these examples:</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Peanut butter, wheat bread, milk',
                'Shrimp, soy sauce, sesame oil',
                'Chocolate cake with eggs and dairy',
              ].map((example) => (
                <motion.button
                  key={example}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInputText(example)}
                  className="px-4 py-2 bg-card border border-border rounded-lg text-sm hover:border-primary transition-colors"
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Image upload mode */}
      {scanMode === 'image' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="size-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="size-10 text-white" />
              </div>
              <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Upload Image
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Click to upload an image of ingredient labels or food packaging
              </p>
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScanMode(null)}
            className="w-full px-6 py-3 rounded-xl bg-muted hover:bg-accent transition-colors"
          >
            Back
          </motion.button>

          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="size-12 mx-auto mb-3"
              >
                <Sparkles className="size-12 text-primary" />
              </motion.div>
              <p className="text-primary">Processing image with AI...</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Barcode mode */}
      {scanMode === 'barcode' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="size-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-chart-3 to-chart-3/80 flex items-center justify-center">
              <Barcode className="size-16 text-white" />
            </div>
            <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Barcode Scanner
            </h3>
            <p className="text-muted-foreground mb-6">
              Camera access required for barcode scanning
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // In production, this would open camera for barcode scanning
                alert('Camera barcode scanner would open here. This is a demo.');
              }}
              className="bg-chart-3 text-white px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Open Camera
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScanMode(null)}
            className="w-full px-6 py-3 rounded-xl bg-muted hover:bg-accent transition-colors"
          >
            Back
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
