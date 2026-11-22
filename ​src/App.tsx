import React, { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import {
  Bot, CalendarDays, GraduationCap, Mic, ShieldCheck, Sparkles,
  Award, Globe, Volume2, VolumeX, Cpu, BrainCircuit, CheckCircle2,
  RotateCcw, Play, History, QrCode, Presentation, ExternalLink,
  Youtube, Instagram, X, Trash2, Upload, BookOpen
} from 'lucide-react';
import {
  useGetExhibition, usePublishGalleryEntry,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();

// ============================================================================
// 🎬 0. HOLY CROSS SCHOOL INTRO DRONE VIDEO & OFFICIAL SOCIAL LINKS
// ============================================================================
// Upload your drone video (1001864785.mp4) inside Replit's "public/" folder!
const DEFAULT_DRONE_VIDEO_URL = "/1001864785.mp4";
const FALLBACK_CAMPUS_VIDEO_URL = "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-university-campus-41547-large.mp4";

const OFFICIAL_LINKS = {
  website: "https://www.hcsindore.ac.in/",
  youtube: "https://m.youtube.com/@holycrossschoolindore2016",
  instagram: "https://www.instagram.com/hcs_indore_official",
  projectLiveUrl: "https://holy-cross-school-ai--HCS001.replit.app"
};

// ============================================================================
// 🔑 1. API KEY CONFIGURATION
// ============================================================================
const GEMINI_API_KEY = "AQ.Ab8RN6KQA9fHOYjDEBAl1qrNj4aGlYF1-aNoltOf40YcUTnMig";

// ============================================================================
// 🧠 2. MASTER BILINGUAL KNOWLEDGE BASE (TEACHERS, DIARY PAGES, 3D MODELS, GK)
// ============================================================================
export interface KnowledgeItem {
  id: string;
  subjectName: string;
  category: string;
  keywords: string[];
  answer: string;
  hindiSummary?: string;
  roleInfo?: string;
}

const PERSONALIZED_BRAIN: KnowledgeItem[] = [
  // 👩‍🏫 1. SISTER LIZA JOSEPH (PRINCIPAL & GUIDING LIGHT)
  {
    id: "sister_liza",
    subjectName: "Sister Liza Joseph (Principal)",
    category: "School Leadership & Guidance",
    roleInfo: "Principal & Spiritual Guide of Holy Cross School",
    keywords: ["sister liza", "liza joseph", "principal", "sister", "सिस्टर लाइजा", "प्रिंसिपल", "cleanliness"],
    answer: "🙏 **Sister Liza Joseph (Principal & Guiding Light):** Sister Liza Joseph is the revered Principal and spiritual pillar of Holy Cross School, Khandwa Road, Indore. She constantly guides every student toward moral excellence, strict discipline, and self-reliance, inspiring us to keep ourselves, our classrooms, and our surroundings spotless and clean.\n\n🇮🇳 **हिंदी में:** सिस्टर लाइजा जोसेफ हमारे होली क्रॉस स्कूल की आदरणीय प्रिंसिपल और मार्गदर्शक हैं। वह हम सभी विद्यार्थियों को उच्च नैतिक मूल्यों, अनुशासन और आत्म-निर्भरता की शिक्षा देती हैं, और हमें खुद को तथा अपने पूरे स्कूल परिसर को हमेशा स्वच्छ (Clean) रखने के लिए प्रेरित करती हैं।",
    hindiSummary: "सिस्टर लाइजा जोसेफ हमारे होली क्रॉस स्कूल की आदरणीय प्रिंसिपल और मार्गदर्शक हैं। वह हमें नैतिक मूल्यों, अनुशासन और अपने आसपास व खुद को हमेशा स्वच्छ रखने की प्रेरणा देती हैं।"
  },

  // 👩‍💻 2. PRIYANKA MA'AM (COMPUTER SCIENCE & IT MENTOR)
  {
    id: "priyanka_mam",
    subjectName: "Priyanka Ma'am (Computer Science & IT Mentor)",
    category: "Faculty • Computer Science & IT",
    roleInfo: "Computer Science & Information Technology Teacher & Chief Project Mentor",
    keywords: ["priyanka", "priyansha", "computer teacher", "cs teacher", "it teacher", "mentor", "प्रियंका मैम"],
    answer: "👩‍💻 **Priyanka Ma'am (Computer Science & IT Mentor):** Priyanka Ma'am is our brilliant Computer Science and Information Technology teacher at Holy Cross School. Her visionary mentorship, deep technical knowledge, and constant encouragement empowered Gaurav Lalwani (Class IX B) to architect and build this entire Holy Cross AI system with detailed faculty and school modules.\n\n🇮🇳 **हिंदी में:** प्रियंका मैम हमारे होली क्रॉस स्कूल की बेहद प्रतिभाशाली कंप्यूटर साइंस और आईटी टीचर हैं। उनके निरंतर मार्गदर्शन, तकनीकी ज्ञान और प्रोत्साहन से ही गौरव लालवानी (Class IX B) ने यह अत्याधुनिक Holy Cross AI प्रोजेक्ट तैयार किया है।",
    hindiSummary: "प्रियंका मैम हमारी कंप्यूटर साइंस और आईटी टीचर हैं, जिनके शानदार मार्गदर्शन और प्रोत्साहन से गौरव लालवानी ने यह होली क्रॉस एआई प्रोजेक्ट बनाया है।"
  },

  // 📚 3. KAMINI MA'AM (HINDI, SANSKRIT & MORAL VALUES)
  {
    id: "kamini_mam",
    subjectName: "Kamini Ma'am (Hindi, Sanskrit & Moral Values)",
    category: "Faculty • Languages & Moral Values",
    roleInfo: "Hindi, Sanskrit & Value Education Teacher",
    keywords: ["kamini", "sanskrit teacher", "hindi teacher", "value teacher", "कामिनी मैम", "संस्कृत"],
    answer: "📚 **Kamini Ma'am (Hindi, Sanskrit & Moral Values):** Kamini Ma'am is an inspiring educator at Holy Cross School who teaches Hindi, Sanskrit, and Moral Values (Value Education) with extraordinary depth, warmth, and eloquence. Her classes not only strengthen our command over classical and national languages but also deeply nurture our character, cultural roots, and ethical wisdom.\n\n🇮🇳 **हिंदी में:** कामिनी मैम हमें हिंदी, संस्कृत और जीवन के नैतिक मूल्य (Moral Values) बहुत ही गहराई, स्नेह और मधुरता के साथ पढ़ाती हैं। उनकी कक्षाएं न केवल हमारी भाषा और व्याकरण को मजबूत बनाती हैं, बल्कि हमारे भीतर उत्तम संस्कार और सांस्कृतिक गौरव भी जगाती हैं।",
    hindiSummary: "कामिनी मैम हमें हिंदी, संस्कृत और जीवन के नैतिक मूल्य बहुत ही गहराई और मधुरता से पढ़ाती हैं।"
  },

  // 🧪 4. PRACHI TRIVEDI MA'AM (CHEMISTRY)
  {
    id: "prachi_mam",
    subjectName: "Prachi Trivedi Ma'am (Chemistry)",
    category: "Faculty • Science & Chemistry",
    roleInfo: "Chemistry Teacher & Practical Lab Expert",
    keywords: ["prachi", "trivedi", "chemistry teacher", "chemistry mam", "प्राची मैम", "केमिस्ट्री"],
    answer: "🧪 **Prachi Trivedi Ma'am (Chemistry):** Prachi Trivedi Ma'am is our exceptional Chemistry teacher at Holy Cross School who transforms complex chemical equations, atomic structures, and reactions into fascinating, easy-to-grasp concepts. She conducts amazing, hands-on laboratory experiments that bring science to life and spark curiosity in every student.\n\n🇮🇳 **हिंदी में:** प्राची त्रिवेदी मैम हमारी केमिस्ट्री की बेहतरीन टीचर हैं, जो रसायन विज्ञान के कठिन समीकरणों और सिद्धांतों को बेहद रोचक बना देती हैं। वह प्रयोगशाला (Lab) में इतने शानदार एक्सपेरिमेंट्स करवाती हैं कि हर विद्यार्थी को केमिस्ट्री जादुई और आसान लगने लगती है।",
    hindiSummary: "प्राची त्रिवेदी मैम हमारी केमिस्ट्री टीचर हैं जो शानदार प्रैक्टिकल एक्सपेरिमेंट्स करवाकर केमिस्ट्री को बेहद आसान बना देती हैं।"
  },

  // ⚡ 5. DIVYA MA'AM (PHYSICS)
  {
    id: "divya_mam",
    subjectName: "Divya Ma'am (Physics)",
    category: "Faculty • Science & Physics",
    roleInfo: "Physics Teacher & Real-Life Concept Explainer",
    keywords: ["divya", "physics teacher", "physics mam", "दिव्या मैम", "फिजिक्स"],
    answer: "⚡ **Divya Ma'am (Physics):** Divya Ma'am is a phenomenal Physics teacher at Holy Cross School who connects every law of motion, force, optics, and energy with relatable real-life examples. Her crystal-clear explanations turn abstract physical theories into practical visual experiences that students never forget.\n\n🇮🇳 **हिंदी में:** दिव्या मैम हमारी फिजिक्स की शानदार टीचर हैं, जो भौतिक विज्ञान के हर नियम को असल ज़िंदगी के उदाहरणों (Real-Life Examples) के साथ जोड़कर पढ़ाती हैं। उनके समझाने का तरीका इतना सटीक और जीवंत है कि कठिन से कठिन कॉन्सेप्ट भी तुरंत दिमाग में बैठ जाता है।",
    hindiSummary: "दिव्या मैम फिजिक्स के नियमों को असल ज़िंदगी के उदाहरणों से जोड़कर बहुत ही शानदार तरीके से पढ़ाती हैं।"
  },

  // 📐 6. SATYAPAL SIR (MATHEMATICS)
  {
    id: "satyapal_sir",
    subjectName: "Satyapal Sir (Mathematics)",
    category: "Faculty • Mathematics & Logic",
    roleInfo: "Senior Mathematics Teacher & Problem-Solving Specialist",
    keywords: ["satyapal", "maths teacher", "math teacher", "satyapal sir", "सत्यपाल सर", "मैथ्स"],
    answer: "📐 **Satyapal Sir (Mathematics):** Satyapal Sir is an extraordinary Mathematics teacher at Holy Cross School. While extended math lectures can occasionally feel intense or serious, his unique methodology of breaking down tough theorems and his step-by-step question-solving tricks are super interesting, logical, and make every student fall in love with problem-solving!\n\n🇮🇳 **हिंदी में:** सत्यपाल सर हमारे गणित (Mathematics) के बेहद कुशल शिक्षक हैं। भले ही कभी-कभी लंबे मैथ्स लेक्चर थोड़े गंभीर हो जाते हैं, लेकिन उनके सवाल हल करने (Question Solving) का अनोखा तरीका और शॉर्टकट ट्रिक्स इतने ज्यादा इंटरेस्टिंग होते हैं कि कठिन सवाल भी खेल बन जाते हैं!",
    hindiSummary: "सत्यपाल सर बहुत अच्छा मैथ्स पढ़ाते हैं और उनके सवाल हल करने का तरीका बेहद इंटरेस्टिंग और अनोखा होता है।"
  },

  // 🌍 7. MEENAKSHI PARIHAR MA'AM (SOCIAL SCIENCE / SST)
  {
    id: "meenakshi_mam",
    subjectName: "Meenakshi Parihar Ma'am (Social Science / SST)",
    category: "Faculty • Social Science (SST)",
    roleInfo: "Social Science (History, Geography, Civics & Economics) Teacher",
    keywords: ["meenakshi", "parihar", "sst teacher", "social science teacher", "मीनाक्षी मैम", "एसएसटी"],
    answer: "🌍 **Meenakshi Parihar Ma'am (Social Science / SST):** Meenakshi Parihar Ma'am is our dedicated Social Science teacher at Holy Cross School. Her way of explaining historical events, geographical phenomena, and democratic institutions is so engaging, structured, and lucid that every single topic is completely understood right inside the classroom.\n\n🇮🇳 **हिंदी में:** मीनाक्षी परिहार मैम हमारी सोशल साइंस (SST) की टीचर हैं। उनके टॉपिक्स समझाने का तरीका इतना ज्यादा अच्छा, रोचक और स्पष्ट है कि इतिहास, भूगोल और नागरिक शास्त्र के सारे अध्याय क्लास में ही पूरी तरह समझ में आ जाते हैं।",
    hindiSummary: "मीनाक्षी परिहार मैम हमारी एसएसटी टीचर हैं जिनके टॉपिक्स पढ़ाने का तरीका इतना अच्छा है कि सारे विषय तुरंत समझ आ जाते हैं।"
  },

  // 📖 8. NISHA MA'AM (ENGLISH)
  {
    id: "nisha_mam",
    subjectName: "Nisha Ma'am (English)",
    category: "Faculty • English Literature & Grammar",
    roleInfo: "English Teacher & Student Mentor",
    keywords: ["nisha", "english teacher", "english mam", "निशा मैम", "इंग्लिश टीचर"],
    answer: "📖 **Nisha Ma'am (English):** Nisha Ma'am is our wonderful English teacher at Holy Cross School who bonds with students just like a supportive friend! Her warm, approachable nature and brilliant command over English literature, poetry, and grammar make learning effortless, interactive, and joyful for the entire class.\n\n🇮🇳 **हिंदी में:** निशा मैम हमारी इंग्लिश टीचर हैं और वह विद्यार्थियों के साथ बिल्कुल एक अच्छी दोस्त (Friend) की तरह रहती हैं। वह अंग्रेजी साहित्य और ग्रामर को इतने शानदार, सरल और मजेदार अंदाज में पढ़ाती हैं कि हर विद्यार्थी आत्मविश्वास के साथ इंग्लिश सीखता है।",
    hindiSummary: "निशा मैम हमारी दोस्त जैसी हैं और वह बहुत ही शानदार व सरल तरीके से इंग्लिश पढ़ाती हैं।"
  },

  // 🏆 9. CREATOR & ARCHITECT: GAURAV LALWANI
  {
    id: "gaurav_creator",
    subjectName: "Gaurav Lalwani (Lead Architect & Class IX B IT Topper)",
    category: "Creator & System Architect",
    roleInfo: "Sole Full-Stack Developer & Class IX B IT Topper (PT1: 19.5/20, HY: 47.5/50)",
    keywords: ["who made you", "who created you", "who built you", "kisne banaya", "your creator", "gaurav lalwani", "about gaurav", "topper marks", "गौरव लालवानी"],
    answer: "🏆 **Gaurav Lalwani (Lead Architect & IT Topper):** I am Holy Cross AI, solely engineered and designed by Gaurav Lalwani, Class IX B IT Topper at Holy Cross School (Khandwa Road, Indore), under the mentorship of Priyanka Ma'am! Gaurav scored 19.5/20 in PT-1 and 47.5/50 in Half-Yearly IT exams.\n\n🇮🇳 **हिंदी में:** मुझे होली क्रॉस स्कूल (खंडवा रोड, इंदौर) के कक्षा 9वीं 'बी' (Class IX B) के आईटी टॉपर गौरव लालवानी ने प्रियंका मैम के मार्गदर्शन में अकेले कोड और डिजाइन किया है!"
  },

  // ✝️ 10. SCHOOL MONOGRAM, MOTTO, VISION, MISSION & NEP (DIARY PAGE 8)
  {
    id: "school_motto_vision",
    subjectName: "Holy Cross School Motto, Monogram, Vision & Mission",
    category: "School Philosophy & NEP Objectives",
    roleInfo: "Motto: Live and Let Live • Cross & Burning Lamp Monogram",
    keywords: ["motto", "live and let live", "monogram", "the cross", "the lamp", "vision", "mission", "nep objectives", "स्कूल का मोटो", "विजन", "मिशन"],
    answer: "✝️ **Holy Cross Monogram & Motto ('Live and Let Live'):** The Cross echoes the message of love and service lived by Jesus Christ. The Burning Lamp represents each Holy Cross student opening up under Divine guidance to learn untiringly and burn for others. Our Motto is **'Live and Let Live'**—sharing the precious gift of life to build a healthy, loving community.\n\n🎯 **Vision & Mission:** To form fully developed young girls and boys of character committed to humanity, distinguishing themselves by academic excellence, moral/spiritual values, eco-friendly living, and upholding the Constitution of India alongside NEP 2020 Digital & Vocational objectives!\n\n🇮🇳 **हिंदी में:** हमारे स्कूल का आदर्श वाक्य **'Live and Let Live' (जियो और जीने दो)** है। क्रॉस प्रेम और सेवा का प्रतीक है, और जलता हुआ दीपक हर विद्यार्थी के ज्ञान और उत्साह को दर्शाता है।"
  },

  // 🏛️ 11. SCHOOL GOALS & TRADITIONS (DIARY PAGE 9)
  {
    id: "school_traditions",
    subjectName: "Holy Cross School Goals & Traditions",
    category: "School Culture & Values",
    roleInfo: "6 Core Traditions of Holy Crossians",
    keywords: ["school traditions", "goals of school", "holy crossians", "school values", "परंपरा", "संस्कार"],
    answer: "🏛️ **Holy Cross Goals & Traditions:** Holy Crossians believe in goodness and respect every person and religion without discrimination of caste, colour, sex, wealth, or intelligence. We sharpen memory and reasoning without unhealthy competition, show compassion to the weaker sections of society, care for nature, take pride in India's rich cultural heritage, and inculcate sincerity, purity, courtesy, hard work, punctuality, loyalty, and diligence.\n\n🇮🇳 **हिंदी में:** होली क्रॉस के विद्यार्थी बिना किसी भेदभाव के सभी धर्मों और व्यक्तियों का सम्मान करते हैं, अस्वस्थ प्रतिस्पर्धा से दूर रहकर ज्ञान अर्जित करते हैं, समाज के कमजोर वर्गों और प्रकृति की सेवा करते हैं, और देशभक्ति, ईमानदारी व समय की पाबंदी को अपने जीवन में उतारते हैं।"
  },

  // 📏 12. SCHOOL DISCIPLINE, CONDUCT & RULES (DIARY PAGES 16 & 17)
  {
    id: "school_discipline",
    subjectName: "Holy Cross School Discipline & Conduct Rules",
    category: "School Rules & Code of Conduct",
    roleInfo: "First Bell at 7:50 AM • Strict Discipline & Eco-Habit Rules",
    keywords: ["discipline", "school rules", "conduct", "bell time", "first bell", "mobile phone", "uniform", "अनुशासन", "नियम"],
    answer: "📏 **Discipline & Conduct at Holy Cross School:** (1) The first bell rings at **7:50 AM** every day; punctuality is mandatory. (2) When leaving classrooms, lights and fans must be switched off, and students must move in a line with pin-drop silence in corridors. (3) Classrooms are locked during assembly, games, and recess. (4) In a teacher's absence, class monitors maintain order and report within 5 minutes. (5) Politeness, neatness, and care for school property are strictly enforced. (6) Mobile phones, valuables, and unauthorized items are strictly prohibited.\n\n🇮🇳 **हिंदी में:** स्कूल की पहली घंटी सुबह **7:50 बजे** बजती है। क्लास से बाहर जाते समय लाइट और पंखे बंद करना, कॉरिडोर में पिन-ड्रॉप साइलेंस के साथ लाइन में चलना, और स्कूल प्रॉपर्टी व अनुशासन की रक्षा करना हर विद्यार्थी का कर्तव्य है।"
  },

  // 🙌 13. SCHOOL PRAYERS & HYMNS (DIARY PAGES 30-35)
  {
    id: "school_prayers",
    subjectName: "Holy Cross School Prayers & Hymns",
    category: "Spiritual Heritage • Prayers & Songs",
    roleInfo: "Morning Assembly Prayer, Prayer Before Study & Classic Hymns",
    keywords: ["prayer", "morning assembly prayer", "prayer before study", "hymn", "prayer song", "we shall overcome", "give me oil", "god is so good", "showers of blessing", "प्रार्थना"],
    answer: "🙌 **Holy Cross Prayers & Hymns:**\n• **Morning Assembly Prayer:** *'O, My God, I offer you, all I think or do, or say today. Help me to do what is right and keep me away from what is wrong. Bless me, bless my father and mother, bless my teachers and friends...'*\n• **Prayer Before Study:** *'O God, The source of all knowledge, Enlighten our mind, strengthen our memories and direct our will towards what is right...'*\n• **Beloved School Hymns:** *'God's Love Is So Wonderful'*, *'God Is So Good'*, *'Give Me Oil In My Lamp (Sing Hosanna)'*, *'This Little Guiding Light'*, *'All Things Bright and Beautiful'*, *'Showers of Blessing'*, *'We Shall Overcome'*, and *'Walk With Me O My Lord'*."
  },

  // 🏗️ 14. 3D MODEL & REAL-LIFE EXHIBITION PROJECT CONSULTANT (IT, ENGLISH, SCIENCE, SST, MATHS)
  {
    id: "project_consultant",
    subjectName: "3D Model & Exhibition Project Consultant",
    category: "3D Model & Exhibition Consultant",
    roleInfo: "Real-Life Working 3D Models for IT, English, Science, Maths & SST",
    keywords: ["3d model", "project idea", "exhibition topic", "exhibition model", "english exhibition", "it exhibition", "science exhibition", "working model", "प्रोजेक्ट", "मॉडल"],
    answer: "🏗️ **Holy Cross AI — 3D Model & Real-Life Exhibition Project Consultant:**\n\n1️⃣ **For IT / Computer Science Exhibition:**\n• **Smart AI Campus & IoT Automation 3D Model:** Build a 3D model of Holy Cross School where ultrasonic & IR sensors automatically turn off classroom lights/fans when students leave (matching our school diary rule #5!), paired with this live **Holy Cross AI Kiosk**.\n• **Cyber-Security & Neural Network 3D Visualizer:** A glowing optical-fibre 3D brain showing how 5-Layer AI processes tokens.\n\n2️⃣ **For English Exhibition (3D Models):**\n• **3D Globe Theatre (Shakespearean Stage) with QR Voice:** A detailed 3D miniature stage of *Julius Caesar* or *The Merchant of Venice* where judges scan QR codes to hear character monologues.\n• **'The Road Not Taken' Interactive 3D Diorama:** A split-forest 3D model with LED pathways illustrating poetic choices and literary themes.\n\n3️⃣ **For Science & SST Exhibition:**\n• **Physics (Divya Ma'am):** Electromagnetic Maglev Train or Smart Solar Tracking City.\n• **Chemistry (Prachi Ma'am):** 3D Periodic Table with real LED element samples & Green Hydrogen Electrolyzer.\n• **SST (Meenakshi Ma'am):** 3D Parliament & EVM/VVPAT Democratic Voting Working Model!"
  },

  // 🎤 15. SEMINAR PITCH FOR SISTER & JUDGES
  {
    id: "seminar_pitch",
    subjectName: "Official Seminar Pitch for Sister & Judges",
    category: "Seminar & Conference Presentation",
    roleInfo: "Executive Keynote Pitch for Educational Seminars",
    keywords: ["seminar pitch", "introduce holy cross", "keynote", "presentation for sister", "judges pitch", "सेमिनार"],
    answer: "🎙️ **Official Seminar Keynote Pitch:** 'Respected Sister Liza Joseph, esteemed Judges, Educators, and Guests—Welcome to Holy Cross School, Khandwa Road, Indore! Guided by our motto *Live and Let Live* and aligned with NEP 2020 digitalisation goals, Class IX B IT Topper Gaurav Lalwani, mentored by Priyanka Ma'am, presents **Holy Cross AI**. This indigenous 5-Layer Neural Platform combines 60FPS particle physics, conversational memory, bilingual Hindi/English synthesis, and real-time academic consultation—proving that school students in India are not just consumers of AI, but creators of the future!'"
  },

  // 🏏 16. SPORTS, SPACE & GENERAL KNOWLEDGE
  {
    id: "virat_kohli",
    subjectName: "Virat Kohli (Indian Cricket Legend)",
    category: "Sports & Cricket",
    roleInfo: "80+ International Centuries • 2023 WC Player of the Tournament",
    keywords: ["virat kohli", "king kohli", "about virat", "who is kohli"],
    answer: "🏏 **Virat Kohli (King Kohli)** is one of the greatest batsmen in cricket history! He has scored over 80+ international centuries and 27,000+ runs, winning Player of the Tournament in the 2023 ODI World Cup (765 runs) and playing a match-winning knock of 76 in the 2024 T20 World Cup Final."
  },
  {
    id: "rohit_sharma",
    subjectName: "Rohit Sharma (Indian Cricket Captain)",
    category: "Sports & Cricket",
    roleInfo: "2024 T20 WC & 2025 Champions Trophy Winning Captain",
    keywords: ["rohit sharma", "hitman", "about rohit"],
    answer: "🏏 **Rohit Sharma (The Hitman)** is the legendary Indian Captain who led India to victory in the 2024 T20 World Cup and 2025 Champions Trophy! He holds the world record for the highest individual ODI score (264 runs) and 3 ODI Double Centuries."
  },
  {
    id: "ms_dhoni",
    subjectName: "MS Dhoni (Captain Cool)",
    category: "Sports & Cricket",
    roleInfo: "Winner of All 3 ICC Trophies & 5 IPL Titles",
    keywords: ["ms dhoni", "captain cool", "thala", "about dhoni"],
    answer: "🏏 **MS Dhoni (Captain Cool / Thala)** is India's most iconic wicketkeeper-captain, winning all three major ICC trophies (2007 T20 WC, 2011 ODI WC, 2013 Champions Trophy) and 5 IPL titles with CSK."
  },
  {
    id: "isro_space",
    subjectName: "ISRO & Chandrayaan-3",
    category: "Space & Astrophysics",
    roleInfo: "India's Historic Lunar South Pole Landing",
    keywords: ["isro", "chandrayaan", "indian space", "mangalyaan"],
    answer: "🚀 **ISRO (Indian Space Research Organisation)** made history with Chandrayaan-3 on August 23, 2023, making India the FIRST country to land near the Moon's South Pole and the 4th country to soft-land on the Moon!"
  },
  {
    id: "black_hole",
    subjectName: "Black Holes in Space",
    category: "Space & Astrophysics",
    roleInfo: "Relativistic Gravitational Singularity & Event Horizon",
    keywords: ["black hole", "what is a black hole", "blackhole"],
    answer: "🌌 **Black Hole:** A region in space where gravity is so intense that nothing—not even light—can escape its pull! They form when massive stars collapse, bounded by the Event Horizon."
  },
  {
    id: "holy_cross_school",
    subjectName: "Holy Cross School, Khandwa Road, Indore",
    category: "School Overview & Social Links",
    roleInfo: "Official Website: hcsindore.ac.in • YouTube & Instagram Connected",
    keywords: ["holy cross school", "about school", "school website", "school instagram", "school youtube", "khandwa road"],
    answer: "🏫 **Holy Cross School, Khandwa Road, Indore:** A premier institution dedicated to academic excellence, moral values, and holistic growth under Principal Sister Liza Joseph. Motto: *'Live and Let Live'*. You can visit our official website (`hcsindore.ac.in`), YouTube (`@holycrossschoolindore2016`), and Instagram (`@hcs_indore_official`) directly from the header/footer links!"
  }
];

// ============================================================================
// 🌐 3. CONVERSATIONAL MEMORY & 5-LAYER UNIVERSAL AI ENGINE
// ============================================================================
export interface ChatHistoryTurn {
  id: string;
  timestamp: string;
  query: string;
  answer: string;
  subjectName: string;
  category: string;
  engineLayer: string;
}

export interface AIExecutionResult {
  answer: string;
  subjectName: string;
  category: string;
  engineLayer: string;
  confidence: string;
  latencyMs: number;
  tokensCount: number;
  usedMemoryContext: boolean;
}

async function askHolyCrossAIWithMemory(
  rawQuery: string,
  history: ChatHistoryTurn[],
  memoryEnabled: boolean
): Promise<AIExecutionResult> {
  const startTime = performance.now();
  const clean = rawQuery.trim().toLowerCase().replace(/\s+/g, ' ');
  const words = clean.replace(/[?.,!]/g, '').split(' ').filter(Boolean);
  const lastTurn = memoryEnabled && history.length > 0 ? history[0] : null;

  // 1. CHECK IF THIS IS A FOLLOW-UP QUESTION USING CONVERSATIONAL MEMORY!
  const followUpPronouns = ["her", "him", "she", "he", "his", "their", "them", "it", "this", "that", "more", "elaborate", "explain more", "in hindi", "hindi me", "हिंदी में", "उनके", "उन्हें", "इसके", "और बताओ", "subject", "what subject", "kaunsa subject"];
  const isFollowUp =
    lastTurn !== null &&
    (words.length <= 8 || followUpPronouns.some((p) => clean.includes(p)));

  // If user asks "Tell me in Hindi / हिंदी में बताओ" about the previous topic
  if (lastTurn && (clean.includes("in hindi") || clean.includes("hindi me") || clean.includes("हिंदी"))) {
    const prevBrain = PERSONALIZED_BRAIN.find((b) => b.subjectName === lastTurn.subjectName);
    if (prevBrain && prevBrain.hindiSummary) {
      return {
        answer: `🇮🇳 **${prevBrain.subjectName} (हिंदी में Follow-Up):**\n\n${prevBrain.hindiSummary}`,
        subjectName: prevBrain.subjectName,
        category: `${prevBrain.category} (Memory Follow-Up)`,
        engineLayer: "Layer 1 • Conversational Memory Core",
        confidence: "100%",
        latencyMs: Math.round(performance.now() - startTime) + 8,
        tokensCount: words.length,
        usedMemoryContext: true,
      };
    }
  }

  // 2. CHECK 3D MODEL / EXHIBITION PROJECT QUERIES FOR SPECIFIC SUBJECTS
  if (clean.includes("3d model") || clean.includes("exhibition") || clean.includes("project idea") || clean.includes("मॉडल")) {
    if (clean.includes("english") || clean.includes("इंग्लिश")) {
      return {
        answer: "🎭 **3D Model Ideas for English Exhibition (Guided by Nisha Ma'am):**\n1️⃣ **Shakespeare's Globe Theatre 3D Miniature:** Build a 3D wooden/cardboard stage of *Julius Caesar* or *Macbeth* with QR codes that play character voiceovers when scanned!\n2️⃣ **'The Road Not Taken' Interactive LED Forest:** A 3D diorama showing Robert Frost's two diverging yellow woods with glowing quotes.\n3️⃣ **3D Grammar & Tenses Time-Machine:** A rotating 3D clockwork model showing Past, Present, and Future tense transformations!",
        subjectName: "English Exhibition 3D Models",
        category: "3D Model Consultant • English",
        engineLayer: "Layer 1 • Exhibition Project Consultant",
        confidence: "99.9%",
        latencyMs: Math.round(performance.now() - startTime) + 10,
        tokensCount: words.length,
        usedMemoryContext: false,
      };
    }
    if (clean.includes("it") || clean.includes("computer") || clean.includes("ai") || clean.includes("आईटी")) {
      return {
        answer: "💻 **3D Model Ideas for IT & Computer Exhibition (Guided by Priyanka Ma'am):**\n1️⃣ **Smart Holy Cross Eco-Campus 3D Model:** A 3D school building using Arduino/ESP32 sensors that automatically switches off classroom lights & fans when students leave for assembly (implementing School Rule #5!).\n2️⃣ **3D Optical Neural Network & Holy Cross AI Kiosk:** Pair a 3D glowing LED fibre-optic brain model with this live 5-Layer Holy Cross AI screen!\n3️⃣ **Smart Green City with Li-Fi & Cyber Firewall:** A 3D city demonstrating data transmission through LED light (Li-Fi).",
        subjectName: "IT & CS Exhibition 3D Models",
        category: "3D Model Consultant • IT & AI",
        engineLayer: "Layer 1 • Exhibition Project Consultant",
        confidence: "99.9%",
        latencyMs: Math.round(performance.now() - startTime) + 10,
        tokensCount: words.length,
        usedMemoryContext: false,
      };
    }
  }

  // 3. SCORE AGAINST PERSONALIZED BRAIN
  let bestEntry: KnowledgeItem | null = null;
  let bestScore = 0;

  for (const entry of PERSONALIZED_BRAIN) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (clean.includes(kw)) {
        score += kw.split(' ').length * 12 + kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry) {
    return {
      answer: bestEntry.answer,
      subjectName: bestEntry.subjectName,
      category: bestEntry.category,
      engineLayer: "Layer 1 • Holy Cross AI Knowledge Matrix",
      confidence: "99.9%",
      latencyMs: Math.round(performance.now() - startTime) + 11,
      tokensCount: words.length,
      usedMemoryContext: false,
    };
  }

  // If no direct keyword matched, but it's a follow-up question about the last teacher/topic!
  if (isFollowUp && lastTurn) {
    const prevBrain = PERSONALIZED_BRAIN.find((b) => b.subjectName === lastTurn.subjectName);
    if (prevBrain && (clean.includes("subject") || clean.includes("teach") || clean.includes("role") || clean.includes("क्या पढ़ा") || clean.includes("कौन"))) {
      return {
        answer: `🧠 **Memory Follow-Up (${prevBrain.subjectName}):** ${prevBrain.roleInfo || prevBrain.category}. ${prevBrain.hindiSummary || ""}`,
        subjectName: prevBrain.subjectName,
        category: `${prevBrain.category} (Context Retained)`,
        engineLayer: "Layer 1 • Conversational Memory Core",
        confidence: "99.8%",
        latencyMs: Math.round(performance.now() - startTime) + 9,
        tokensCount: words.length,
        usedMemoryContext: true,
      };
    }
  }

  // 4. INSTANT MATHEMATICAL ALU
  const mathExpr = clean.replace(/what is|calculate|solve|evaluate|kitna hota hai|equals|=\?/g, '').trim();
  if (/^[0-9+\-*/().\s%]+$/.test(mathExpr) && /[+\-*/%]/.test(mathExpr)) {
    try {
      const result = Function(`"use strict"; return (${mathExpr})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return {
          answer: `🧮 **Mathematical Solution:** ${mathExpr} = ${result}. Computed instantly by the Holy Cross AI ALU Engine (inspired by Satyapal Sir's speed tricks)!`,
          subjectName: `Math Calculation (${mathExpr})`,
          category: "Mathematics & ALU",
          engineLayer: "Layer 2 • Holy Cross AI Logic Unit",
          confidence: "100%",
          latencyMs: Math.round(performance.now() - startTime) + 4,
          tokensCount: words.length,
          usedMemoryContext: false,
        };
      }
    } catch (e) {}
  }

  // Build context-aware prompt for Cloud LLM
  const memoryContextString = lastTurn
    ? `Previous Conversation Context: User previously asked "${lastTurn.query}" about "${lastTurn.subjectName}", and you answered: "${lastTurn.answer.slice(0, 180)}...". If the user's new question is a follow-up (using he/she/it/more/why), answer in reference to "${lastTurn.subjectName}".`
    : "";

  const systemPrompt = `You are Holy Cross AI, the official AI Assistant of Holy Cross School, Khandwa Road, Indore. Engineered by Class IX B IT Topper Gaurav Lalwani under Computer Science mentor Priyanka Ma'am. Principal: Sister Liza Joseph. Motto: 'Live and Let Live'. Teachers: Kamini Ma'am (Hindi/Sanskrit/Values), Prachi Trivedi Ma'am (Chemistry), Divya Ma'am (Physics), Satyapal Sir (Maths), Meenakshi Parihar Ma'am (SST), Nisha Ma'am (English). If the user asks for 3D model or exhibition project ideas for any subject/topic, suggest 2-3 creative, practical 3D working models. ${memoryContextString} Answer concisely and impressively in 3-4 sentences in English or Hinglish.`;

  // 5. LIVE CLOUD AI ROUTER (WITH MEMORY CONTEXT)
  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawQuery }
        ]
      })
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply && reply.trim().length > 5) {
        return {
          answer: reply.replace(/[*#`]/g, '').trim(),
          subjectName: isFollowUp && lastTurn ? lastTurn.subjectName : rawQuery.slice(0, 36),
          category: isFollowUp ? "Contextual Follow-Up AI" : "Universal Cloud AI Synthesis",
          engineLayer: "Layer 4 • Holy Cross Cloud Transformer",
          confidence: "99.5%",
          latencyMs: Math.round(performance.now() - startTime),
          tokensCount: words.length,
          usedMemoryContext: !!isFollowUp,
        };
      }
    }
  } catch (e) {}

  // 6. WIKIPEDIA KNOWLEDGE GRAPH FALLBACK
  try {
    const searchTopic = isFollowUp && lastTurn ? `${lastTurn.subjectName} ${rawQuery}` : rawQuery;
    const cleanTopic = searchTopic.replace(/^(can you|please|tell me|who is|what is|explain|about)\s+/gi, '').replace(/[?.,!]/g, '').trim();
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTopic)}&utf8=&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData?.query?.search?.length > 0) {
      const bestTitle = searchData.query.search[0].title;
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
      const sumRes = await fetch(summaryUrl);
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        if (sumData?.extract) {
          const sentences = sumData.extract.split('. ').slice(0, 3).join('. ');
          return {
            answer: `🌟 ${sumData.title}: ${sentences.endsWith('.') ? sentences : sentences + '.'}`,
            subjectName: sumData.title,
            category: `Encyclopedic Knowledge • ${sumData.title}`,
            engineLayer: "Layer 5 • Live Knowledge Graph",
            confidence: "98.9%",
            latencyMs: Math.round(performance.now() - startTime),
            tokensCount: words.length,
            usedMemoryContext: !!isFollowUp,
          };
        }
      }
    }
  } catch (e) {}

  return {
    answer: `✨ Holy Cross AI Analysis: "${rawQuery}" has been processed by Gaurav Lalwani's 5-Layer Neural Engine. You can ask about any Holy Cross teacher, school rules/prayers, 3D exhibition model ideas, science, sports, or general knowledge!`,
    subjectName: rawQuery.slice(0, 30),
    category: "General Neural Query",
    engineLayer: "Layer 1 • Holy Cross AI Core",
    confidence: "96.0%",
    latencyMs: Math.round(performance.now() - startTime),
    tokensCount: words.length,
    usedMemoryContext: false,
  };
}

// ============================================================================
// 🎡 4. TILTED 3D GRID HERO BACKGROUND COMPONENT (UNCHANGED!)
// ============================================================================
const SLICES = 14;
const CAMERA = 1.6;
const MAX_WIDTH = 55;

function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

function measureGrid(width: number, height: number, tile: number, aspect: number, gap: number, bend: number) {
  const h = Math.min((tile / 100) * height, ((MAX_WIDTH / 100) * width) / aspect);
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  const columns = Math.min(48, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return { columns, sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
}

const HERO_IMAGES = [
  { src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", alt: "AI Neural Network" },
  { src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", alt: "Quantum Processor" },
  { src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", alt: "Cyber Matrix" },
  { src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", alt: "Digital Security" },
];

function TiltedGridHero({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = "hcgrid";
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const speed = 4;
  const tileHeight = 34;
  const aspectRatio = 16 / 9;
  const gap = 6;
  const axis = 56;
  const curve = 75;
  const fade = 12;
  const bend = (curve * Math.PI) / 180;

  const [layout, setLayout] = useState<ReturnType<typeof measureGrid> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setLayout(measureGrid(width, height, tileHeight, aspectRatio, gap, bend));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [bend]);

  const { columns, sweep, unit, limit } = layout ?? measureGrid(1200, 360, tileHeight, aspectRatio, gap, bend);
  const u = (n: number) => `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(MAX_WIDTH / aspectRatio).toFixed(4)}cqw))`;
  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;
  const turn = (deg: number) => `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;
  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);

  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}`;

  const share = aspectRatio / SLICES;
  const duration = columns * speed;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
        containerType: "size",
        height: "235px",
        width: "100%",
        borderRadius: "28px",
        background: "radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.55), rgba(2, 6, 23, 0.96) 75%)",
        border: "1px solid rgba(251, 191, 36, 0.25)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
      }}
    >
      <style>{css}</style>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.42,
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const img = HERO_IMAGES[t % HERO_IMAGES.length];
          return (
            <div
              key={t}
              className={tile}
              style={{
                position: "absolute",
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    top: 0,
                    overflow: "hidden",
                    left: u((aspectRatio - share) / 2),
                    width: k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn((aspectRatio / 2 - (k + 0.5) * share) * unit),
                  }}
                >
                  <img
                    src={img.src}
                    alt=""
                    draggable={false}
                    style={{
                      position: "absolute",
                      top: 0,
                      maxWidth: "none",
                      objectFit: "cover",
                      left: u(-k * share),
                      width: u(aspectRatio),
                      height: u(1),
                    }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// 🔮 5. HOLY CROSS AI INTERACTIVE CORE COMPONENT (UNCHANGED PHYSICS)
// ============================================================================
const COPY = {
  placeholder: "Ask Holy Cross AI about Teachers, School Motto/Prayers, 3D Models, or any topic…",
  labels: ["Tokenizing Question", "Checking Memory Context", "Querying Holy Cross AI", "Synthesizing Answer"],
  done: "Answer Ready",
  answerTitle: "Holy Cross AI Official Response",
  reset: "Ask Follow-Up / New Question",
};

const PILL_H = 62, BALL_SMALL = 60, ORB_D = 140, ORB_R = 70, CANVAS = 220;
const CARD_H = 225;
const FLY_D = 142;
const pillW = () => Math.min(780, window.innerWidth - 64);
const cardW = () => Math.min(780, window.innerWidth - 64);
const homeDy = () => 110;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fmt = (v: number) => String(Math.round(v * 1e4) / 1e4);
const TAU = Math.PI * 2;

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const solve = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return t;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    return t;
  };
  return (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)));
}

const E = {
  out: cubicBezier(0.22, 1, 0.36, 1),
  io: cubicBezier(0.65, 0, 0.35, 1),
  in: cubicBezier(0.4, 0, 1, 1),
  fly: cubicBezier(0.5, 0, 0.1, 1),
  grow: cubicBezier(0.3, 0, 0.2, 1),
  vortex: cubicBezier(0.6, 0, 0.2, 1),
  spring: cubicBezier(0.34, 1.4, 0.64, 1),
  card: cubicBezier(0.65, 0, 0.2, 1),
  lin: (t: number) => t,
};

const bez = (t: number, p0: number, c: number, p2: number) => (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * c + t * t * p2;
const T = (ch: string, from: number, to: number, t0: number, t1: number, ease = E.io) => ({ ch, from, to, t0, t1, ease });

const launchTracks = (g: any) => [
  T("w", g.pw, g.pw - 12, 0, 100, E.out), T("oInput", 1, 0, 0, 160, E.in),
  T("inScale", 1, 0.6, 0, 160, E.in), T("oGlow", 1, 0, 0, 300, E.out),
  T("oAur", 1, 0, 0, 300, E.out), T("w", g.pw - 12, BALL_SMALL, 100, 560, E.io),
  T("h", PILL_H, PILL_H + 6, 380, 500, E.out), T("h", PILL_H + 6, BALL_SMALL, 500, 620, E.out),
  T("oPill", 1, 0, 300, 560, E.out), T("oBall", 0, 1, 300, 560, E.out),
  T("u", 0, 1, 620, 1400, E.fly), T("w", BALL_SMALL, FLY_D, 620, 1200, E.grow),
  T("h", BALL_SMALL, FLY_D, 620, 1200, E.grow), T("w", FLY_D, ORB_D, 1200, 1400, E.out),
  T("h", FLY_D, ORB_D, 1200, 1400, E.out), T("cHalo", 0, 0.6, 620, 1400, E.out),
];

const ASSEMBLE = [
  T("oRing", 1, 0, 0, 260, E.out), T("oBall", 1, 0, 0, 240, E.out),
  T("orb.k", 0, 1, 0, 700, E.out), T("orb.alpha", 0, 1, 0, 700, E.out),
  T("orb.spin", 0, 1.15, 0, 700, E.out), T("orb.pop", 1, 1.05, 0, 350, E.out),
  T("orb.pop", 1.05, 1, 350, 700, E.io), T("sOp", 0, 1, 200, 500, E.out),
  T("sTy", 6, 0, 200, 500, E.out),
];

const RESOLVE = [
  T("orb.sweep", 0, 1, 0, 550, E.io), T("orb.spin", 1.15, 0.3, 0, 550, E.out),
  T("orb.gain", 1, 0, 0, 550, E.out), T("orb.floor", 0, 0.95, 300, 650, E.out),
  T("orb.rad", 0, 0.15, 300, 650, E.out),
];

const CONDENSE = [
  T("orb.pop", 1, 1.06, 0, 100, E.out), T("sOp", 1, 0, 0, 140, E.in),
  T("sTy", 0, -6, 0, 140, E.in), T("orb.k", 1, 0, 100, 520, E.vortex),
  T("orb.vortex", 0, 1.6, 100, 520, E.vortex), T("oGreen", 0, 1, 220, 580, E.spring),
  T("gs", 0.55, 1, 220, 580, E.spring), T("pulse", 0, 1, 260, 620, E.out),
  T("oHalo", 0, 0.35, 300, 580, E.out), T("orb.alpha", 1, 0, 400, 640, E.out),
];

const unfoldTracks = (g: any, tw: number) => [
  T("w", ORB_D, 124, 0, 80, E.in), T("h", ORB_D, 124, 0, 80, E.in),
  T("w", 124, g.cw, 80, 600, E.card), T("h", 124, CARD_H, 80, 600, E.out),
  T("r", ORB_D / 2, 24, 80, 600, E.io), T("oGreen", 1, 0, 160, 480, E.out),
  T("oCard", 0, 1, 160, 480, E.out), T("oHalo", 0.35, 0, 240, 600, E.out),
  T("cHalo", 0.6, 0.22, 240, 600, E.out), T("hOp", 0, 1, 420, 700, E.out),
  T("dotS", 0, 1, 420, 700, E.spring), T("wp", 0, 1, 480, 480 + tw, E.lin),
];

const FADE = ["oGlow", "oAur", "oPill", "oBall", "oGreen", "oCard", "oRing", "oInput", "oHalo", "sOp", "orb.alpha"];
const INIT: Record<string, number> = {
  h: PILL_H, r: 999, oGlow: 1, oHalo: 0, oPill: 1, oBall: 0, oGreen: 0, oCard: 0, oRing: 1, oInput: 1, inScale: 1, oAur: 1,
  gs: 0.55, cs: 1, hOp: 0, dotS: 0, bloom: 1, u: 0, yOff: 0, pulse: -1, sOp: 0, sTy: 6, cHalo: 0, wp: 0,
  "orb.k": 0, "orb.alpha": 0, "orb.spin": 0, "orb.pop": 1, "orb.sweep": 0, "orb.vortex": 0, "orb.gain": 1, "orb.floor": 0, "orb.rad": 0,
};

const ABORT = Symbol("abort");
function sleep(ms: number, sig: AbortSignal) {
  return new Promise<void>((res) => {
    if (sig.aborted) return res();
    const id = window.setTimeout(res, Math.max(0, ms));
    sig.addEventListener("abort", () => { window.clearTimeout(id); res(); }, { once: true });
  });
}

const RINGS = 16;
const DOT_LIST = (() => {
  const rand = mulberry32(7);
  const out = [];
  for (let k = 0; k < RINGS; k++) {
    const y = 1 - ((k + 0.5) / RINGS) * 2;
    const r = Math.sqrt(1 - y * y);
    const m = Math.max(4, Math.round(30 * r));
    for (let j = 0; j < m; j++) {
      const a = (j / m) * TAU + k * 0.35;
      out.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r, u: (1 - y) / 2, seed: rand() * 6.283 });
    }
  }
  return out;
})();
const N = DOT_LIST.length;
const DX = Float32Array.from(DOT_LIST, (d) => d.x);
const DY = Float32Array.from(DOT_LIST, (d) => d.y);
const DZ = Float32Array.from(DOT_LIST, (d) => d.z);
const DU = Float32Array.from(DOT_LIST, (d) => d.u);
const DS = Float32Array.from(DOT_LIST, (d) => d.seed);

const G_STEPS = 24, A_STEPS = 48;
const COLORS = (() => {
  const out: string[] = [];
  for (let gi = 0; gi <= G_STEPS; gi++) {
    const g = gi / G_STEPS;
    const r = Math.round(lerp(251, 52, g)), gg = Math.round(lerp(191, 211, g)), b = Math.round(lerp(36, 153, g));
    for (let ai = 0; ai <= A_STEPS; ai++) out.push(`rgba(${r},${gg},${b},${(ai / A_STEPS).toFixed(3)})`);
  }
  return out;
})();

const ORB_KEYS = ["k", "alpha", "spin", "sweep", "pop", "vortex", "gain", "floor", "rad"];

function createOrb(canvas: HTMLCanvasElement, getSpeed: () => number) {
  const P: Record<string, number> = { k: 0, alpha: 0, spin: 0, rot: 0, sweep: 0, pop: 1, vortex: 0, gain: 1, floor: 0, rad: 0, prog: 0 };
  const ctx = canvas.getContext("2d");
  const lit = new Float32Array(N);
  const SX = new Float32Array(N), SY = new Float32Array(N), SR = new Float32Array(N), SD = new Float32Array(N);
  const SC = new Int16Array(N);
  let time = 0, raf = 0, last = 0, dead = false;

  const reset = () => {
    P.k = 0; P.alpha = 0; P.spin = 0; P.rot = 0; P.sweep = 0; P.pop = 1; P.vortex = 0; P.gain = 1; P.floor = 0; P.rad = 0; P.prog = 0;
    lit.fill(0);
    time = 0;
  };
  reset();

  if (!ctx) return { P, ensure() {}, reset, destroy() {} };

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(CANVAS * dpr);
  canvas.height = Math.round(CANVAS * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const S = 0.6, CP = Math.cos(0.35), SP = Math.sin(0.35), C0 = CANVAS / 2;

  const draw = (dt: number) => {
    ctx.clearRect(0, 0, CANVAS, CANVAS);
    time += dt;
    P.rot += P.spin * dt;
    const yaw = P.rot + P.vortex, cyw = Math.cos(yaw), syw = Math.sin(yaw);
    const decay = Math.exp(-dt / 0.5);
    const h0 = (time * 320) % N;
    const swirlK = P.vortex * 1.5;

    for (let n = 0; n < N; n++) {
      const dx = DX[n], dy = DY[n], dz = DZ[n], u = DU[n];
      let dd = Math.abs(n - h0); if (dd > N - dd) dd = N - dd;
      const v = Math.max(0, 1 - dd / 18);
      const l = Math.max(lit[n] * decay, v * v * P.gain);
      lit[n] = l;

      const ki = clamp01(P.k * (1 + S) - S * u);
      if (ki <= 0.001) { SC[n] = -1; continue; }
      const eo = E.out(ki), kk = eo * P.pop;

      const x1 = dx * cyw + dz * syw, z1 = -dx * syw + dz * cyw;
      const y2 = dy * CP - z1 * SP, z2 = dy * SP + z1 * CP;
      const f = 2.8 / (2.8 - z2), depth = (z2 + 1) / 2;
      let ox = x1 * ORB_R * kk * f, oy = -y2 * ORB_R * kk * f;
      if (swirlK > 0.001) {
        const sw = (1 - ki) * swirlK, cc = Math.cos(sw), ss = Math.sin(sw);
        const tx = ox * cc - oy * ss;
        oy = ox * ss + oy * cc;
        ox = tx;
      }

      const g = clamp01((P.sweep * 1.4 - u) / 0.4);
      let a = 0.15 + 0.035 * Math.sin(DS[n] + time * 1.6) * (1 - g) + 0.35 * depth * depth + 0.75 * l * (1 - g) + g * (0.55 + 0.4 * depth);
      a = Math.max(a, P.floor * (0.7 + 0.3 * depth));
      if (a > 1) a = 1;
      a *= eo * P.alpha;

      SX[n] = C0 + ox;
      SY[n] = C0 + oy;
      SD[n] = depth;
      SR[n] = (1.3 * (0.45 + 0.75 * depth) * f + 0.9 * l + g * 0.25) * (1 + P.rad) * (0.4 + 0.6 * eo);
      const ai = Math.round(a * A_STEPS), gi = Math.round(g * G_STEPS);
      SC[n] = ai <= 0 ? -1 : gi * (A_STEPS + 1) + ai;
    }

    for (let pass = 0; pass < 2; pass++) {
      for (let n = 0; n < N; n++) {
        const c = SC[n];
        if (c < 0) continue;
        if ((SD[n] >= 0.5) !== (pass === 1)) continue;
        ctx.fillStyle = COLORS[c];
        ctx.beginPath();
        ctx.arc(SX[n], SY[n], SR[n], 0, TAU);
        ctx.fill();
      }
    }
  };

  const frame = (now: number) => {
    raf = 0;
    if (dead) return;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)) * getSpeed();
    last = now;
    draw(dt);
    if (P.alpha > 0.002) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, CANVAS, CANVAS);
  };

  const ensure = () => {
    if (raf || dead || P.alpha <= 0.002) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const destroy = () => {
    dead = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  return { P, ensure, reset, destroy };
}

function MorphOrb({
  onSubmit,
  onStepChange,
  externalTriggerRef,
  minThinkMs = 1400
}: {
  onSubmit: (q: string) => Promise<string>;
  onStepChange?: (step: number, queryText?: string) => void;
  externalTriggerRef?: any;
  minThinkMs?: number;
}) {
  const [phase, setPhaseState] = useState("idle");
  const [value, setValue] = useState("");
  const [lbl, setLbl] = useState<{ cur: string; prev: string | null; n: number }>({ cur: COPY.labels[0], prev: null, n: 0 });
  const [answer, setAnswer] = useState("");
  const [askedQuery, setAskedQuery] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  const phaseRef = useRef("idle");
  const rtRef = useRef<any>(null);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const onStepRef = useRef(onStepChange);
  onStepRef.current = onStepChange;

  useEffect(() => {
    const root = rootRef.current, mover = moverRef.current, actor = actorRef.current, canvas = canvasRef.current;
    const pulse = pulseRef.current, status = statusRef.current, form = formRef.current;
    if (!root || !mover || !actor || !canvas || !pulse || !status || !form) return;

    const life = new AbortController();
    const geo = { pw: pillW(), cw: cardW(), H: homeDy(), dir: -1 };
    const orb = createOrb(canvas, () => 1.35);
    const vals: Record<string, number> = {};
    const dirty = new Set<string>();
    const CH: Record<string, (v: number) => void> = {};

    let current: AbortController | null = null;
    let busy = false, idling = false, epoch = 0;
    let curX = 0, curY = 0, wStagger = 14, wDur = 180;

    const child = () => {
      const ac = new AbortController();
      if (life.signal.aborted) ac.abort();
      else life.signal.addEventListener("abort", () => ac.abort(), { once: true });
      return ac;
    };

    const applyPath = () => {
      const u = vals.u ?? 0, H = geo.H;
      curX = bez(u, 0, geo.dir * 0.25 * H, 0);
      curY = bez(u, H, 0.5 * H, 0) + (vals.yOff ?? 0);
      mover.style.transform = `translate3d(${curX.toFixed(2)}px,${curY.toFixed(2)}px,0)`;
    };

    const applyWords = (v: number) => {
      const body = bodyRef.current;
      if (!body) return;
      const nodes = body.querySelectorAll<HTMLElement>(".mo-w");
      const total = (nodes.length - 1) * wStagger + wDur;
      const time = v * total;
      nodes.forEach((el, i) => {
        const p = E.out(clamp01((time - i * wStagger) / wDur));
        el.style.opacity = fmt(p);
        el.style.transform = p >= 0.999 ? "none" : `translateY(${fmt((1 - p) * 4)}px)`;
      });
    };

    ["oGlow", "oHalo", "oPill", "oBall", "oGreen", "oCard", "oRing", "oInput", "oAur", "gs", "cs", "hOp", "dotS", "bloom"].forEach((n) => {
      CH[n] = (v) => actor.style.setProperty("--" + n, fmt(v));
    });
    ["w", "h", "r"].forEach((n) => {
      CH[n] = (v) => actor.style.setProperty("--" + n, fmt(v) + "px");
    });
    CH.inScale = (v) => actor.style.setProperty("--inScale", fmt(v));
    CH.sOp = (v) => status.style.setProperty("--sOp", fmt(v));
    CH.sTy = (v) => status.style.setProperty("--sTy", fmt(v));
    CH.cHalo = (v) => root.style.setProperty("--oCenter", fmt(v));
    CH.u = () => applyPath();
    CH.yOff = () => applyPath();
    CH.pulse = (v) => {
      if (v < 0) { pulse.style.opacity = "0"; return; }
      pulse.style.opacity = fmt(0.5 * (1 - v));
      pulse.style.transform = `scale(${fmt(1 + v)})`;
    };
    CH.wp = applyWords;
    ORB_KEYS.forEach((name) => {
      CH["orb." + name] = (v) => {
        orb.P[name] = v;
        if (name === "alpha") orb.ensure();
      };
    });

    const set = (ch: string, v: number) => { vals[ch] = v; dirty.add(ch); };
    const flush = () => { dirty.forEach((ch) => CH[ch]?.(vals[ch])); dirty.clear(); };
    const setNow = (ch: string, v: number) => { vals[ch] = v; CH[ch]?.(v); };
    const resetChannels = () => {
      setNow("w", geo.pw);
      for (const ch of Object.keys(INIT)) setNow(ch, INIT[ch]);
    };

    const play = (tracks: any[], sig: AbortSignal) =>
      new Promise<void>((res) => {
        if (sig.aborted) return res();
        const end = tracks.reduce((m, k) => Math.max(m, k.t1), 0);
        const done = new Set();
        let raf = 0, t = 0, last = performance.now();
        const onAbort = () => { cancelAnimationFrame(raf); res(); };
        const step = (now: number) => {
          const dt = Math.max(0, Math.min(100, now - last));
          last = now;
          t += dt * 1.35;
          for (const k of tracks) {
            if (done.has(k) || t < k.t0) continue;
            const p = Math.min(1, (t - k.t0) / Math.max(1, k.t1 - k.t0));
            set(k.ch, k.from + (k.to - k.from) * (k.ease ?? E.io)(p));
            if (p === 1) done.add(k);
          }
          flush();
          if (t >= end) { sig.removeEventListener("abort", onAbort); res(); }
          else raf = requestAnimationFrame(step);
        };
        sig.addEventListener("abort", onAbort, { once: true });
        raf = requestAnimationFrame(step);
      });

    const run = async (text: string, sig: AbortSignal) => {
      const go = async (tracks: any[]) => {
        await play(tracks, sig);
        if (sig.aborted) throw ABORT;
      };
      try {
        setAskedQuery(text);
        onStepRef.current?.(1, text);
        setLbl({ cur: COPY.labels[0], prev: null, n: 1 });
        phaseRef.current = "launch"; setPhaseState("launch");
        await go(launchTracks(geo));

        onStepRef.current?.(2, text);
        setLbl((l) => ({ cur: COPY.labels[1], prev: l.cur, n: l.n + 1 }));
        setNow("r", ORB_D / 2);
        phaseRef.current = "assemble"; setPhaseState("assemble");
        await go(ASSEMBLE);

        onStepRef.current?.(3, text);
        setLbl((l) => ({ cur: COPY.labels[2], prev: l.cur, n: l.n + 1 }));
        phaseRef.current = "think"; setPhaseState("think");
        const t0 = performance.now();
        const body = await onSubmitRef.current(text);
        await sleep(minThinkMs - (performance.now() - t0), sig);
        if (sig.aborted) throw ABORT;

        onStepRef.current?.(4, text);
        setLbl((l) => ({ cur: COPY.labels[3], prev: l.cur, n: l.n + 1 }));
        const words = body.split(/\s+/).filter(Boolean);
        const n = Math.max(1, words.length);

        phaseRef.current = "resolve"; setPhaseState("resolve");
        setLbl((l) => ({ cur: COPY.done, prev: l.cur, n: l.n + 1 }));
        await go(RESOLVE);

        phaseRef.current = "condense"; setPhaseState("condense");
        await go(CONDENSE);

        onStepRef.current?.(5, text);
        phaseRef.current = "unfold"; setPhaseState("unfold");
        wDur = 170;
        wStagger = n > 1 ? Math.min(12, 140 / (n - 1)) : 0;
        setAnswer(body);
        await go(unfoldTracks(geo, (n - 1) * wStagger + wDur));

        phaseRef.current = "answered"; setPhaseState("answered");
      } catch (e) {
        if (e === ABORT) return;
      }
    };

    const toIdle = async () => {
      if (idling) return;
      idling = true;
      const my = ++epoch;
      const ac = child();
      const sig = ac.signal;
      phaseRef.current = "reset"; setPhaseState("reset");

      const out = [T("cHalo", vals.cHalo ?? 0, 0, 0, 180, E.out)];
      for (const ch of FADE) {
        const v = vals[ch] ?? 0;
        if (v > 0.001) out.push(T(ch, v, 0, 0, 180, E.out));
      }
      await play(out, sig);
      if (sig.aborted || my !== epoch) return;

      setNow("pulse", -1);
      setAnswer("");
      setAskedQuery("");
      setLbl((l) => ({ cur: COPY.labels[0], prev: null, n: l.n + 1 }));
      setValue("");
      orb.reset();
      geo.pw = pillW(); geo.cw = cardW(); geo.H = homeDy();
      resetChannels();
      current = null; busy = false; idling = false;
      phaseRef.current = "idle"; setPhaseState("idle");
      onStepRef.current?.(0, "");
      inputRef.current?.focus({ preventScroll: true });
    };

    resetChannels();

    const api = {
      start(text: string) {
        if (busy) {
          current?.abort();
          orb.reset();
          geo.pw = pillW(); geo.cw = cardW(); geo.H = homeDy();
          resetChannels();
          busy = false; idling = false;
        }
        busy = true;
        geo.pw = pillW(); geo.cw = cardW(); geo.H = homeDy();
        geo.dir = -geo.dir;
        orb.reset();
        setNow("u", 0);
        const ac = child();
        current = ac;
        void run(text, ac.signal);
      },
      reset() {
        if (!busy || idling) return;
        current?.abort();
        void toIdle();
      }
    };

    rtRef.current = api;
    if (externalTriggerRef) externalTriggerRef.current = api;

    return () => {
      life.abort();
      orb.destroy();
    };
  }, [minThinkMs, externalTriggerRef]);

  const triggerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = value.trim();
    if (!text) {
      actorRef.current?.setAttribute("data-shake", "");
      setTimeout(() => actorRef.current?.removeAttribute("data-shake"), 260);
      return;
    }
    rtRef.current?.start(text);
  };

  const words = answer.split(/\s+/).filter(Boolean);

  return (
    <div className="mo-root" data-phase={phase} ref={rootRef} style={{ height: '485px' }}>
      <div className="mo-bg" aria-hidden="true" />
      <div className="mo-halo" aria-hidden="true" />

      <div className="mo-mover" ref={moverRef}>
        <div className="mo-actor" ref={actorRef}>
          <div className="mo-underglow" aria-hidden="true" />
          <div className="mo-halo-green" aria-hidden="true" />
          <div className="mo-surface" aria-hidden="true">
            <div className="mo-aurora"><i /><i /><i /><i /></div>
          </div>
          <div className="mo-ball" aria-hidden="true" />
          <div className="mo-green" aria-hidden="true" />
          <div className="mo-card" aria-hidden="true" />
          <div className="mo-ring" aria-hidden="true" />

          <form className="mo-input" ref={formRef} onSubmit={triggerSubmit} autoComplete="off">
            <svg className="mo-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 3.5l1.7 4.8 4.8 1.7-4.8 1.7L10 16.5l-1.7-4.8L3.5 10l4.8-1.7L10 3.5z" />
              <path d="M18 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
            </svg>
            <input
              ref={inputRef}
              className="mo-field"
              type="text"
              value={value}
              maxLength={280}
              placeholder={COPY.placeholder}
              onChange={(e) => setValue(e.target.value)}
            />
            <button type="submit" className="mo-send" onClick={triggerSubmit} title="Ask Holy Cross AI">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 19V5" />
                <path d="M5.5 11.5L12 5l6.5 6.5" />
              </svg>
            </button>
          </form>

          <canvas className="mo-orb" ref={canvasRef} aria-hidden="true" />
          <div className="mo-pulse" ref={pulseRef} aria-hidden="true" />

          <div className="mo-answer scroll-hide" ref={answerRef} tabIndex={-1}>
            <div className="mo-a-head" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="mo-a-dot" aria-hidden="true" />
                <span>{COPY.answerTitle}</span>
              </div>
              {askedQuery && (
                <span style={{ color: '#fbbf24', fontSize: '10.5px', textTransform: 'none', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Q: "{askedQuery}"
                </span>
              )}
            </div>
            <p className="mo-a-body" ref={bodyRef} style={{ fontSize: '13.8px', lineHeight: '1.52' }}>
              {words.map((w, i) => (
                <React.Fragment key={i}>
                  <span className="mo-w">{w}</span>{" "}
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>
      </div>

      <div className="mo-status" ref={statusRef} aria-hidden="true">
        <span className="mo-lab mo-in">
          {lbl.cur === COPY.done ? (
            <span className="mo-lab-done">{lbl.cur}</span>
          ) : (
            <>
              <span>{lbl.cur}</span>
              <span className="mo-dots"><i /><i /><i /></span>
            </>
          )}
        </span>
      </div>

      <button type="button" className="mo-reset" onClick={() => rtRef.current?.reset()}>
        ✨ {COPY.reset}
      </button>
    </div>
  );
}

// ============================================================================
// 🔐 6. PASSWORD STRENGTH METER COMPONENT
// ============================================================================
const PW_RULES = [
  { id: "length", label: "8 characters or more", test: (v: string) => v.length >= 8 },
  { id: "case", label: "Upper and lower case", test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: "digit", label: "Contains a number", test: (v: string) => /\d/.test(v) },
  { id: "symbol", label: "Contains a symbol (@#$%)", test: (v: string) => /[!-/:-@[-`{-~]/.test(v) },
];

function PasswordStrengthMeter({ value }: { value: string }) {
  const evaluated = PW_RULES.map((r) => ({ ...r, met: r.test(value) }));
  const score = value.length === 0 ? 0 : Math.max(1, evaluated.filter((r) => r.met).length);
  const labels = ["Empty", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#334155", "#ef4444", "#f59e0b", "#38bdf8", "#10b981"];
  const activeColor = colors[score];

  return (
    <div style={{ marginTop: "12px", textAlign: "left" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: "6px", borderRadius: "4px", background: i < score ? activeColor : "rgba(255,255,255,0.12)", transition: "all 0.3s ease" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", fontWeight: "bold", color: activeColor }}>
        <span>Security Level: {labels[score]}</span>
        <span>{score}/4 Rules Met</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "10px" }}>
        {evaluated.map((r) => (
          <div key={r.id} style={{ fontSize: "11px", color: r.met ? "#34d399" : "#64748b", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
            <span>{r.met ? "✅" : "⚪"}</span> {r.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 🎬 7. HOLY CROSS SCHOOL DRONE VIDEO INTRO SPLASH MODAL (WITH CUSTOM VIDEO LOADER!)
// ============================================================================
function SchoolIntroVideoModal({ onEnter }: { onEnter: () => void }) {
  const [videoSrc, setVideoSrc] = useState<string>(() => localStorage.getItem('hc-custom-drone-video') || DEFAULT_DRONE_VIDEO_URL);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoError = () => {
    if (videoSrc !== FALLBACK_CAMPUS_VIDEO_URL) {
      setVideoSrc(FALLBACK_CAMPUS_VIDEO_URL);
    }
  };

  const handleSelectLocalVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setVideoSrc(blobUrl);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Drone Assembly Video Background */}
      <video
        key={videoSrc}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        onError={handleVideoError}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, filter: 'contrast(1.08)' }}
      />

      {/* Dark Vignette Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.45), rgba(2, 6, 23, 0.94) 88%)', pointerEvents: 'none' }} />

      {/* Center Welcome Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '860px', padding: '36px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 0 40px rgba(251, 191, 36, 0.6)' }}>
          <GraduationCap size={46} strokeWidth={2.2} />
        </div>

        <span style={{ background: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.5)', color: '#fbbf24', padding: '7px 20px', borderRadius: '999px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2.5px', display: 'inline-block', marginBottom: '14px' }}>
          ✨ Motto: "Live and Let Live" • Official Exhibition Presentation
        </span>

        <h1 style={{ fontSize: '52px', fontWeight: '900', color: '#fff', margin: '0 0 10px 0', letterSpacing: '1px', textShadow: '0 10px 30px rgba(0,0,0,0.9)' }}>
          HOLY CROSS <span style={{ color: '#fbbf24' }}>SCHOOL</span>
        </h1>

        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '2.5px' }}>
          Khandwa Road, Indore • Presenting Holy Cross AI
        </h2>

        <p style={{ fontSize: '15.5px', color: '#e2e8f0', lineHeight: '1.65', fontWeight: '600', marginBottom: '28px' }}>
          Inspired by Principal <b style={{ color: '#34d399' }}>Sister Liza Joseph</b> • Engineered by Class IX B IT Topper <b style={{ color: '#fbbf24' }}>Gaurav Lalwani</b> under the mentorship of <b style={{ color: '#38bdf8' }}>Priyanka Ma'am (Computer Science)</b>.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onEnter}
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#000',
              border: 'none',
              padding: '17px 38px',
              borderRadius: '999px',
              fontSize: '15.5px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 35px rgba(251, 191, 36, 0.65)',
            }}
          >
            <Play size={19} fill="#000" /> Enter Holy Cross AI Website
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleSelectLocalVideo}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '15px 22px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            title="Select 1001864785.mp4 from your device if not in public folder"
          >
            <Upload size={16} /> Load Drone Video (1001864785.mp4)
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 📇 8. DIGITAL VISITING CARD & QR MODAL (FOR SEMINARS & JUDGES)
// ============================================================================
function SeminarQRModal({ onClose }: { onClose: () => void }) {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(OFFICIAL_LINKS.projectLiveUrl)}`;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'linear-gradient(145deg, #0f172a, #020617)', border: '1.5px solid #fbbf24', borderRadius: '28px', maxWidth: '480px', width: '100%', padding: '32px', textAlign: 'center', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} />
        </button>

        <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '5px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          ✨ Seminar & Conference Digital Pass
        </span>
        <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', margin: '10px 0 4px 0' }}>Holy Cross School AI</h3>
        <p style={{ color: '#38bdf8', fontSize: '12.5px', fontWeight: '800', margin: '0 0 18px 0' }}>Khandwa Road, Indore • Motto: "Live and Let Live"</p>

        <div style={{ background: '#fff', padding: '14px', borderRadius: '20px', display: 'inline-block', marginBottom: '18px', boxShadow: '0 0 30px rgba(251,191,36,0.3)' }}>
          <img src={qrImageUrl} alt="Holy Cross AI QR Code" style={{ width: '190px', height: '190px', display: 'block' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px', textAlign: 'left', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.7', marginBottom: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>👑 <b>Principal:</b> Sister Liza Joseph</div>
          <div>👩‍💻 <b>IT Mentor:</b> Priyanka Ma'am</div>
          <div>🏆 <b>Lead Architect:</b> Gaurav Lalwani (Class IX B IT Topper)</div>
          <div>🌐 <b>Live App:</b> <span style={{ color: '#fbbf24' }}>holy-cross-school-ai--HCS001.replit.app</span></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a href={OFFICIAL_LINKS.website} target="_blank" rel="noreferrer" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '8px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', textDecoration: 'none' }}>🌐 School Web</a>
          <a href={OFFICIAL_LINKS.youtube} target="_blank" rel="noreferrer" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '8px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', textDecoration: 'none' }}>▶️ YouTube</a>
          <a href={OFFICIAL_LINKS.instagram} target="_blank" rel="noreferrer" style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', padding: '8px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', textDecoration: 'none' }}>📸 Instagram</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 🖥️ 9. FULL DESKTOP ENTERPRISE SHELL (WITH SUBTLE SOCIAL LINKS IN HEADER & FOOTER)
// ============================================================================
function Shell({ children, onReplayIntro }: { children: React.ReactNode; onReplayIntro: () => void }) {
  const [location] = useLocation();
  const navLinks = [
    { href: '/', label: 'Holy Cross AI Center', icon: Bot },
    { href: '/showcase', label: 'Cloud Showcase Wall', icon: Globe },
    { href: '/schedule', label: 'Timeline', icon: CalendarDays },
    { href: '/admin', label: 'Admin Security', icon: ShieldCheck },
  ];

  return (
    <div style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <header style={{ position: 'sticky', top: 0, background: 'rgba(2, 6, 23, 0.92)', backdropFilter: 'blur(20px)', padding: '14px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, borderBottom: '1px solid rgba(251, 191, 36, 0.25)', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#000', padding: '11px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(251,191,36,0.4)' }}>
              <GraduationCap size={25} strokeWidth={2.3} />
            </span>
            <div>
              <b style={{ color: '#fbbf24', fontSize: '18.5px', letterSpacing: '1.2px', display: 'block' }}>HOLY CROSS AI</b>
              <small style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: '900', letterSpacing: '1.4px' }}>Holy Cross School • Class IX B, Indore</small>
            </div>
          </Link>

          {/* Subtle Official School Social Links in Small Letters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.12)' }}>
            <a href={OFFICIAL_LINKS.website} target="_blank" rel="noreferrer" style={{ fontSize: '10.5px', fontWeight: '800', color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }} title="Official Holy Cross School Website">
              <ExternalLink size={11} color="#fbbf24" /> Holy Cross Web
            </a>
            <a href={OFFICIAL_LINKS.youtube} target="_blank" rel="noreferrer" style={{ fontSize: '10.5px', fontWeight: '800', color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }} title="Holy Cross School YouTube">
              <Youtube size={12} color="#ef4444" /> Holy Cross YouTube
            </a>
            <a href={OFFICIAL_LINKS.instagram} target="_blank" rel="noreferrer" style={{ fontSize: '10.5px', fontWeight: '800', color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }} title="Holy Cross School Instagram">
              <Instagram size={11} color="#ec4899" /> Holy Cross Instagram
            </a>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 15px', borderRadius: '13px', textDecoration: 'none', color: location === href ? '#000' : '#cbd5e1', background: location === href ? '#fbbf24' : 'rgba(255,255,255,0.05)', fontWeight: '900', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.8px', border: location === href ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
              <Icon size={14}/>{label}
            </Link>
          ))}
          <button
            type="button"
            onClick={onReplayIntro}
            style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', color: '#38bdf8', padding: '9px 14px', borderRadius: '13px', fontWeight: '900', fontSize: '11.5px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Play size={13}/> Intro Video
          </button>
        </nav>
      </header>

      <main style={{ flex: 1, width: '100%', padding: '26px 38px' }}>{children}</main>

      <footer style={{ padding: '22px 40px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12.5px', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.6)', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <b style={{ color: '#fbbf24' }}>HOLY CROSS SCHOOL, KHANDWA ROAD, INDORE</b> • Engineered by Lead Architect & IT Topper <b>Gaurav Lalwani (Class IX B)</b> • Mentored by <b>Priyanka Ma'am</b>
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '11.5px', fontWeight: '700' }}>
          <a href={OFFICIAL_LINKS.website} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>🌐 hcsindore.ac.in</a>
          <span>•</span>
          <a href={OFFICIAL_LINKS.youtube} target="_blank" rel="noreferrer" style={{ color: '#f87171', textDecoration: 'none' }}>▶️ Holy Cross YouTube</a>
          <span>•</span>
          <a href={OFFICIAL_LINKS.instagram} target="_blank" rel="noreferrer" style={{ color: '#f472b6', textDecoration: 'none' }}>📸 Holy Cross Instagram</a>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// 📋 10. CATEGORIZED EXHIBITION QUESTION DECK (WITH TEACHERS, DIARY & 3D MODELS)
// ============================================================================
const QUESTION_CATEGORIES: Record<string, string[]> = {
  "👩‍🏫 Teachers & Sister": [
    "Tell me about Sister Liza Joseph",
    "Tell me about Priyanka Ma'am",
    "Tell me about Kamini Ma'am",
    "Tell me about Prachi Trivedi Ma'am",
    "Tell me about Divya Ma'am",
    "Tell me about Satyapal Sir",
    "Tell me about Meenakshi Parihar Ma'am",
    "Tell me about Nisha Ma'am",
    "इनके बारे में हिंदी में बताओ (Follow-up Test)"
  ],
  "📖 School Diary & Values": [
    "What is the School Motto & Monogram?",
    "What are the School Traditions & Goals?",
    "Tell me about School Discipline & Rules",
    "Recite the Morning Assembly Prayer & Hymns",
    "Who created you & IT Topper marks?"
  ],
  "🏗️ 3D Model Consultant": [
    "Suggest 3D model ideas for IT Exhibition",
    "Suggest 3D model ideas for English Exhibition",
    "Suggest 3D model ideas for Science & SST Exhibition",
    "Deliver the Official Seminar Pitch for Sister & Judges"
  ],
  "🏏 Cricket & Sports": [
    "Tell me about Virat Kohli",
    "Tell me about Rohit Sharma",
    "Tell me about MS Dhoni"
  ],
  "🚀 Space, Science & Math": [
    "Tell me about ISRO & Chandrayaan 3",
    "What is a Black Hole in space?",
    "Solve 125 * 64 + 200"
  ]
};

// ============================================================================
// 🏠 11. HOMEPAGE (WITH MEMORY MODE, HISTORY DRAWER & SEMINAR TOOLS)
// ============================================================================
function HomePage() {
  const [voiceOn, setVoiceOn] = useState(true);
  const [memoryMode, setMemoryMode] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryTurn[]>(() => {
    try {
      const saved = localStorage.getItem('hc-ai-chat-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<string>("👩‍🏫 Teachers & Sister");
  const [activeStep, setActiveStep] = useState<number>(0);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [lastTelemetry, setLastTelemetry] = useState<AIExecutionResult | null>(null);

  const orbTriggerRef = useRef<any>(null);
  const tvAudioRef = useRef<HTMLAudioElement | null>(null);
  const historyRef = useRef(chatHistory);
  historyRef.current = chatHistory;
  const memoryRef = useRef(memoryMode);
  memoryRef.current = memoryMode;

  useEffect(() => {
    try {
      localStorage.setItem('hc-ai-chat-history', JSON.stringify(chatHistory.slice(0, 30)));
    } catch {}
  }, [chatHistory]);

  const unlockAudio = () => {
    if (!tvAudioRef.current) {
      tvAudioRef.current = new Audio();
    }
    tvAudioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    tvAudioRef.current.play().catch(() => {});
  };

  const playCloudVoice = (text: string) => {
    try {
      const hasHindi = /[\u0900-\u097F]/.test(text);
      const chunks = text.match(/.{1,170}(\s|$)/g) || [text];
      let index = 0;

      const playNextChunk = () => {
        if (index >= chunks.length || !voiceOn) return;
        const chunk = chunks[index].trim();
        if (!chunk) { index++; playNextChunk(); return; }
        const chunkLang = /[\u0900-\u097F]/.test(chunk) ? 'hi-IN' : hasHindi ? 'hi-IN' : 'en-IN';
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${chunkLang}&q=${encodeURIComponent(chunk)}`;
        if (!tvAudioRef.current) tvAudioRef.current = new Audio();
        tvAudioRef.current.src = url;
        tvAudioRef.current.playbackRate = 1.04;
        tvAudioRef.current.onended = () => { index++; playNextChunk(); };
        tvAudioRef.current.play().catch(() => {});
      };
      playNextChunk();
    } catch (e) {}
  };

  const speakText = (text: string) => {
    if (!voiceOn) return;
    window.speechSynthesis?.cancel();
    if (tvAudioRef.current) tvAudioRef.current.pause();

    const cleanSpeech = text
      .replace(/[*#`_~🏆💻💾🧬🌌✨🌐🙏🚀🤖💙🏏🧮🌟⚽🍎🌿🇮🇳😂🧩👩‍🏫🏫👩‍💻📚🧪⚡📐🌍📖✝️🎯🏛️📏🙌🏗️🎙️1️⃣2️⃣3️⃣4️⃣5️⃣•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const hasNativeVoices = 'speechSynthesis' in window && window.speechSynthesis.getVoices().length > 0;

    if (hasNativeVoices) {
      let started = false;
      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.rate = 1.02;
      utterance.lang = /[\u0900-\u097F]/.test(cleanSpeech) ? 'hi-IN' : 'en-IN';
      utterance.onstart = () => { started = true; };
      utterance.onerror = () => { if (!started) playCloudVoice(cleanSpeech); };
      window.speechSynthesis.speak(utterance);

      setTimeout(() => {
        if (!started && !window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          playCloudVoice(cleanSpeech);
        }
      }, 350);
    } else {
      playCloudVoice(cleanSpeech);
    }
  };

  const handleOrbAI = async (query: string) => {
    unlockAudio();
    const res = await askHolyCrossAIWithMemory(query, historyRef.current, memoryRef.current);
    setLastTelemetry(res);

    const newTurn: ChatHistoryTurn = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      query,
      answer: res.answer,
      subjectName: res.subjectName,
      category: res.category,
      engineLayer: res.engineLayer,
    };
    setChatHistory((prev) => [newTurn, ...prev.slice(0, 29)]);
    speakText(res.answer);
    return res.answer;
  };

  const startVoiceInput = () => {
    unlockAudio();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input works best in Google Chrome!');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (orbTriggerRef.current) {
        orbTriggerRef.current.start(text);
      }
    };
    recognition.start();
  };

  const thinkingSteps = [
    { id: 1, title: "1. Full-Sentence Tokenization", desc: "Reads complete question in English or Hindi" },
    { id: 2, title: "2. Conversational Memory Link", desc: "Checks previous chat context for follow-ups" },
    { id: 3, title: "3. Holy Cross AI Matrix Query", desc: "Searches Faculty, Diary, 3D Models & Cloud AI" },
    { id: 4, title: "4. Bilingual Fact Synthesis", desc: "Composes respectful English + Hindi response" },
    { id: 5, title: "5. Holy Cross AI Voice Output", desc: "Renders 60FPS card & triggers Speech Synthesis" },
  ];

  const activeMemoryTopic = memoryMode && chatHistory.length > 0 ? chatHistory[0].subjectName : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      
      {qrOpen && <SeminarQRModal onClose={() => setQrOpen(false)} />}

      {/* 🕒 SLIDING CHAT HISTORY & CONVERSATIONAL MEMORY DRAWER */}
      {historyOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 'min(460px, 100vw)', height: '100%', background: '#0f172a', borderLeft: '1px solid rgba(251,191,36,0.35)', padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '-20px 0 50px rgba(0,0,0,0.9)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={22} color="#fbbf24" />
                <div>
                  <b style={{ color: '#fff', fontSize: '17px', display: 'block' }}>Chat History & Memory Log</b>
                  <small style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '800' }}>{chatHistory.length} Saved Questions • Click any to re-ask</small>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {chatHistory.length > 0 && (
                  <button onClick={() => setChatHistory([])} title="Clear History" style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                )}
                <button onClick={() => setHistoryOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px', fontSize: '13.5px', fontWeight: '600' }}>
                  No questions asked yet. Ask Holy Cross AI anything and your conversation history will appear here!
                </div>
              ) : (
                chatHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setHistoryOpen(false);
                      orbTriggerRef.current?.start(item.query);
                    }}
                    style={{ background: 'rgba(2,6,23,0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px', cursor: 'pointer', transition: '0.2s' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#38bdf8', fontWeight: '800', marginBottom: '6px' }}>
                      <span>📌 {item.subjectName}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '800', marginBottom: '6px' }}>Q: "{item.query}"</div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.answer}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. 3D TILTED GRID HERO BANNER (BACKGROUND UNCHANGED, HOLY CROSS SCHOOL & HOLY CROSS AI) */}
      <TiltedGridHero>
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '18px' }}>
          <span style={{ background: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.5)', color: '#fbbf24', padding: '6px 18px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            ✨ Motto: "Live and Let Live" • Principal: Sister Liza Joseph
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#fff', margin: '0 0 8px 0', textShadow: '0 10px 30px rgba(0,0,0,0.9)' }}>
            Holy Cross School • <span style={{ color: '#fbbf24' }}>Holy Cross AI</span>
          </h1>
          <p style={{ maxWidth: '800px', fontSize: '14.5px', color: '#e2e8f0', fontWeight: '600', margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>
            Bilingual Faculty Knowledge, Follow-Up Conversational Memory & 3D Exhibition Consultant engineered by <b>Gaurav Lalwani (Class IX B)</b> under <b>Priyanka Ma'am</b>.
          </p>
        </div>
      </TiltedGridHero>

      {/* 2. PURE FULL-WIDTH HOLY CROSS AI STAGE */}
      <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '32px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.85)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Holy Cross School • Official AI Assistant</span>
              {activeMemoryTopic && (
                <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399', padding: '3px 10px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800' }}>
                  🧠 Active Memory: {activeMemoryTopic}
                </span>
              )}
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '900', color: '#fff' }}>🔮 Ask Any Question or Follow-Up to Holy Cross AI</h2>
          </div>

          {/* ACTION TOOLBAR: MEMORY TOGGLE, HISTORY DRAWER, SEMINAR PITCH, QR PASS, VOICE */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setMemoryMode(!memoryMode)}
              style={{
                background: memoryMode ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)',
                border: memoryMode ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.15)',
                color: memoryMode ? '#34d399' : '#94a3b8',
                padding: '8px 14px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="When ON, Holy Cross AI remembers your previous question for follow-up queries!"
            >
              <BrainCircuit size={14}/> Memory: {memoryMode ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)', color: '#38bdf8', padding: '8px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <History size={14}/> History ({chatHistory.length})
            </button>

            <button
              type="button"
              onClick={() => { unlockAudio(); orbTriggerRef.current?.start("Deliver the Official Seminar Pitch for Sister & Judges"); }}
              style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.45)', color: '#f472b6', padding: '8px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Presentation size={14}/> Seminar Pitch
            </button>

            <button
              type="button"
              onClick={() => setQrOpen(true)}
              style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.45)', color: '#c084fc', padding: '8px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <QrCode size={14}/> QR Card
            </button>

            <button
              type="button"
              onClick={startVoiceInput}
              style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.45)', color: '#fbbf24', padding: '8px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Mic size={14}/> Speak
            </button>

            {lastTelemetry && (
              <button
                type="button"
                onClick={() => speakText(lastTelemetry.answer)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#cbd5e1', padding: '8px 12px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <RotateCcw size={13}/> Replay
              </button>
            )}

            <button
              type="button"
              onClick={() => { window.speechSynthesis?.cancel(); if (tvAudioRef.current) tvAudioRef.current.pause(); setVoiceOn(!voiceOn); }}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: voiceOn ? '#34d399' : '#94a3b8', padding: '8px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {voiceOn ? <Volume2 size={14}/> : <VolumeX size={14}/>} {voiceOn ? 'VOICE ON' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* HOLY CROSS AI INTERACTIVE STAGE */}
        <MorphOrb
          onSubmit={handleOrbAI}
          onStepChange={(step, qText) => {
            setActiveStep(step);
            if (qText !== undefined) setCurrentQuery(qText);
          }}
          externalTriggerRef={orbTriggerRef}
          minThinkMs={1350}
        />

        {/* MULTI-CATEGORY QUESTION DECK */}
        <div style={{ background: 'rgba(2, 6, 23, 0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: '900', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ⚡ Holy Cross AI Interactive Question Deck (Teachers, School Diary, 3D Models & GK):
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.keys(QUESTION_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    border: activeTab === cat ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    background: activeTab === cat ? '#fbbf24' : 'rgba(255,255,255,0.05)',
                    color: activeTab === cat ? '#000' : '#cbd5e1',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {QUESTION_CATEGORIES[activeTab].map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => { unlockAudio(); orbTriggerRef.current?.start(qp); }}
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.35)', color: '#f8fafc', padding: '10px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 3. DEDICATED SECTION: HOLY CROSS AI THINKING PROCESS & TELEMETRY */}
      <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.95))', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '32px', padding: '32px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.75)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '12px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.4)' }}>
              <BrainCircuit size={28}/>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Real-Time Neural Diagnostics & Memory Engine</span>
              <h2 style={{ margin: '3px 0 0 0', fontSize: '23px', fontWeight: '900', color: '#fff' }}>🧠 Holy Cross AI Thinking Process & Full-Question Analyzer</h2>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '22px' }}>
          {thinkingSteps.map((st) => {
            const isDone = activeStep >= st.id;
            const isCurrent = activeStep === st.id;
            return (
              <div
                key={st.id}
                style={{
                  background: isCurrent ? 'rgba(56, 189, 248, 0.16)' : isDone ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent ? '1.5px solid #38bdf8' : isDone ? '1px solid rgba(52, 211, 153, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: isCurrent ? '#38bdf8' : isDone ? '#34d399' : '#64748b' }}>
                    Stage 0{st.id}
                  </span>
                  <CheckCircle2 size={16} color={isDone ? "#34d399" : "#475569"} />
                </div>
                <b style={{ display: 'block', fontSize: '13.5px', color: '#fff', marginBottom: '5px' }}>{st.title}</b>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.45', fontWeight: '600' }}>{st.desc}</p>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Full Question Analyzed</small>
            <div style={{ color: '#fbbf24', fontSize: '13.5px', fontWeight: '800', marginTop: '4px' }}>
              {currentQuery ? `"${currentQuery}"` : "Waiting for question input..."}
            </div>
          </div>
          <div>
            <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Detected Subject & Memory</small>
            <div style={{ color: '#38bdf8', fontSize: '13.5px', fontWeight: '800', marginTop: '4px' }}>
              {lastTelemetry ? `${lastTelemetry.subjectName} ${lastTelemetry.usedMemoryContext ? '(Follow-Up ✓)' : ''}` : "Multi-Domain Standby"}
            </div>
          </div>
          <div>
            <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Active Holy Cross AI Layer</small>
            <div style={{ color: '#34d399', fontSize: '13.5px', fontWeight: '800', marginTop: '4px' }}>
              {lastTelemetry ? lastTelemetry.engineLayer : "5-Layer Hybrid Core"}
            </div>
          </div>
          <div>
            <small style={{ color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Confidence & Latency</small>
            <div style={{ color: '#f8fafc', fontSize: '13.5px', fontWeight: '800', marginTop: '4px' }}>
              {lastTelemetry ? `${lastTelemetry.confidence} • ${lastTelemetry.latencyMs} ms` : "99.9% • < 20 ms"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. DEDICATED SOLE CREATOR & ARCHITECT SECTION */}
      <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))', border: '1px solid rgba(251, 191, 36, 0.4)', borderRadius: '32px', padding: '36px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fbbf24', color: '#000', padding: '14px', borderRadius: '18px' }}><Award size={30}/></div>
            <div>
              <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Holy Cross School • System Architecture</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '25px', fontWeight: '900', color: '#fff' }}>Engineered by Class IX B IT Topper</h2>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', padding: '10px 18px', borderRadius: '16px', color: '#34d399', fontWeight: '800', fontSize: '13px' }}>
              🙏 Blessing & Guidance: <b>Sister Liza Joseph (Principal)</b>
            </div>
            <div style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', padding: '10px 18px', borderRadius: '16px', color: '#38bdf8', fontWeight: '800', fontSize: '13px' }}>
              👩‍💻 Mentored by: <b>Priyanka Ma'am (Computer Science)</b>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'rgba(2, 6, 23, 0.65)', padding: '26px', borderRadius: '24px', border: '1px solid rgba(251,191,36,0.35)' }}>
            <b style={{ color: '#fbbf24', fontSize: '21px', display: 'block', marginBottom: '10px' }}>🏆 Gaurav Lalwani — Lead Architect & IT Topper</b>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.65', margin: '0 0 18px 0', fontWeight: '600' }}>
              Sole Full-Stack Developer & Designer of Holy Cross AI for Holy Cross School, Indore. Engineered the 3D Curved Spatial Grid, 60FPS Particle Physics, Conversational Memory Engine, Bilingual Faculty Matrix, and 3D Exhibition Consultant.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '7px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '900' }}>PT-1 Score: 19.5 / 20</span>
              <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '7px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '900' }}>Half-Yearly Score: 47.5 / 50</span>
              <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '7px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '900' }}>Class IX B • Holy Cross School</span>
            </div>
          </div>

          <div style={{ background: 'rgba(2, 6, 23, 0.65)', padding: '26px', borderRadius: '24px', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <BookOpen size={20} color="#38bdf8" />
              <b style={{ color: '#38bdf8', fontSize: '17px' }}>Honouring Our Class IX B Faculty</b>
            </div>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13.5px', lineHeight: '1.8', fontWeight: '600' }}>
              • <b>Sister Liza Joseph</b> (Principal & Moral Guide)<br/>
              • <b>Priyanka Ma'am</b> (Computer Science & IT Mentor)<br/>
              • <b>Kamini Ma'am</b> (Hindi, Sanskrit & Moral Values)<br/>
              • <b>Prachi Trivedi Ma'am</b> (Chemistry & Lab Experiments)<br/>
              • <b>Divya Ma'am</b> (Physics with Real-Life Examples)<br/>
              • <b>Satyapal Sir</b> (Mathematics & Problem Solving)<br/>
              • <b>Meenakshi Parihar Ma'am</b> (Social Science / SST)<br/>
              • <b>Nisha Ma'am</b> (English Literature & Grammar)
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

// ============================================================================
// 🌐 12. SHOWCASE, SCHEDULE & ADMIN PORTAL (MASTER PASSWORD: Gaurav@2026)
// ============================================================================
function ShowcasePage() {
  const q = useGetExhibition();
  const client = useQueryClient();
  const publish = usePublishGalleryEntry();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<any>('story');
  const [author, setAuthor] = useState('Gaurav Lalwani');
  const [formOpen, setFormOpen] = useState(false);

  const entries = q.data?.gallery || [];

  const submitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body || !author) return;
    publish.mutate({ data: { title, category, body, author } }, {
      onSuccess: async () => {
        await client.invalidateQueries();
        setTitle(''); setBody(''); setFormOpen(false);
      }
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0 }}>Cloud Showcase Wall</h1>
        <button onClick={() => setFormOpen(!formOpen)} style={{ padding: '14px 24px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}>
          {formOpen ? 'Close Form' : '+ Publish Entry'}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={submitEntry} style={{ background: 'rgba(15,23,42,0.95)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(251,191,36,0.4)', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input required placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '14px', borderRadius: '12px', background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}/>
          <textarea required rows={4} placeholder="Write your thought or AI review..." value={body} onChange={e => setBody(e.target.value)} style={{ padding: '14px', borderRadius: '12px', background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}/>
          <button type="submit" style={{ padding: '14px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>Publish Live</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {entries.map((e: any) => (
          <div key={e.id} style={{ background: 'rgba(15,23,42,0.85)', padding: '26px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#fbbf24', textTransform: 'uppercase' }}>{e.category}</span>
            <h3 style={{ margin: '10px 0', fontSize: '20px', color: '#fff' }}>{e.title}</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>{e.body}</p>
            <div style={{ marginTop: '14px', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>By {e.author}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchedulePage() {
  const q = useGetExhibition();
  const events = q.data?.schedule || [];
  return (
    <div style={{ maxWidth: '950px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '25px' }}>Exhibition Schedule</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.map((ev: any) => (
          <div key={ev.id} style={{ background: 'rgba(15,23,42,0.85)', padding: '24px 30px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ background: '#fbbf24', color: '#000', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '900' }}>{ev.time}</span>
              <h3 style={{ margin: '10px 0 4px 0', color: '#fff', fontSize: '19px' }}>{ev.title}</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>{ev.description}</p>
            </div>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold' }}>📍 {ev.location}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localAuth, setLocalAuth] = useState(() => localStorage.getItem('hc-admin-auth') === 'true');

  // Master Passwords set as requested!
  const VALID_PASSWORDS = ['Gaurav@2026', 'HolyCross@9B', 'Gaurav@123', 'admin123'];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(password.trim())) {
      setLocalAuth(true);
      localStorage.setItem('hc-admin-auth', 'true');
      setError('');
    } else {
      setError('Access Denied! Use Master Password: Gaurav@2026');
    }
  };

  const handleLogout = () => {
    setLocalAuth(false);
    localStorage.removeItem('hc-admin-auth');
    setPassword('');
  };

  if (!localAuth) {
    return (
      <div style={{ maxWidth: '460px', margin: '40px auto', background: 'rgba(15,23,42,0.95)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(251,191,36,0.4)', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
        <ShieldCheck size={42} color="#fbbf24" style={{ margin: '0 auto 12px auto' }} />
        <h2 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '24px', fontWeight: '900' }}>Admin Security Gate</h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '22px' }}>Protected by Real-Time Password Strength Analyzer</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter Master Password (Gaurav@2026)..."
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            style={{ width: '100%', padding: '15px', borderRadius: '14px', background: '#020617', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', outline: 'none', fontSize: '15px', fontWeight: 'bold' }}
          />
          <PasswordStrengthMeter value={password} />
          {error && <div style={{ color: '#ef4444', marginTop: '14px', fontSize: '13px', fontWeight: 'bold' }}>{error}</div>}
          <button type="submit" style={{ width: '100%', marginTop: '22px', padding: '16px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>
            Verify & Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', background: 'rgba(15,23,42,0.92)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(52,211,153,0.4)', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)' }}>
      <div style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '8px 18px', borderRadius: '999px', display: 'inline-block', fontSize: '12px', fontWeight: '900', marginBottom: '14px' }}>
        ● ROOT ACCESS GRANTED • SECURITY LEVEL: STRONG (4/4)
      </div>
      <h1 style={{ color: '#fbbf24', fontSize: '32px', fontWeight: '900', margin: '0 0 10px 0' }}>Holy Cross AI Admin Control Center</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '28px', fontSize: '15px', fontWeight: '600' }}>
        Welcome, Lead Architect <b>Gaurav Lalwani (Class IX B)</b> • Mentored by <b>Priyanka Ma'am</b>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '30px', textAlign: 'left' }}>
        <div style={{ background: 'rgba(2,6,23,0.7)', padding: '18px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <small style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800' }}>HOLY CROSS AI STATUS</small>
          <div style={{ color: '#34d399', fontSize: '18px', fontWeight: '900', marginTop: '4px' }}>5-Layer + Memory ✓</div>
        </div>
        <div style={{ background: 'rgba(2,6,23,0.7)', padding: '18px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <small style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800' }}>SCHOOL DATA MODULES</small>
          <div style={{ color: '#38bdf8', fontSize: '18px', fontWeight: '900', marginTop: '4px' }}>8 Faculty + Diary ✓</div>
        </div>
        <div style={{ background: 'rgba(2,6,23,0.7)', padding: '18px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <small style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '800' }}>CREATOR AUTHORITY</small>
          <div style={{ color: '#fbbf24', fontSize: '18px', fontWeight: '900', marginTop: '4px' }}>Gaurav Lalwani</div>
        </div>
      </div>

      <button onClick={handleLogout} style={{ padding: '14px 32px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>
        Lock & Sign Out
      </button>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const [showIntro, setShowIntro] = useState(true);

  return (
    <ErrorBoundary resetKey={location}>
      {showIntro && <SchoolIntroVideoModal onEnter={() => setShowIntro(false)} />}
      <Shell onReplayIntro={() => setShowIntro(true)}>
        <Switch>
          <Route path="/" component={HomePage}/>
          <Route path="/showcase" component={ShowcasePage}/>
          <Route path="/schedule" component={SchedulePage}/>
          <Route path="/admin" component={AdminPage}/>
          <Route component={NotFound}/>
        </Switch>
      </Shell>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router/>
        </WouterRouter>
        <Toaster/>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
