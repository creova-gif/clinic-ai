import React, { useState } from 'react';
import {
  Search,
  MessageCircle,
  Book,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  HelpCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { useAppStore } from '@/app/store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';

interface SelfHelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  helpful: number;
  notHelpful: number;
}

const translations = {
  sw: {
    title: 'Kituo cha Msaada',
    searchPlaceholder: 'Tafuta msaada...',
    close: 'Funga',
    categories: 'Makundi',
    popularTopics: 'Mada Maarufu',
    askAI: 'Uliza AI Assistant',
    contactSupport: 'Wasiliana na Msaada',
    callUs: 'Tupigie simu',
    emailUs: 'Tutumie barua pepe',
    helpful: 'Inasaidia?',
    yes: 'Ndiyo',
    no: 'Hapana',
    thankYou: 'Asante kwa maoni yako!',
    
    // Categories
    appointments: 'Miadi',
    payments: 'Malipo & NHIF',
    results: 'Matokeo ya Maabara',
    prescriptions: 'Dawa',
    account: 'Akaunti Yangu',
    technical: 'Matatizo ya Kiufundi',
    
    // AI Chat
    aiChatTitle: 'Zungumza na AI Assistant',
    aiPlaceholder: 'Andika swali lako hapa...',
    send: 'Tuma',
    aiDisclaimer: 'AI inasaidia tu, si badala ya daktari',
    
    // Support
    supportHours: 'Masaa ya Huduma: Jumatatu-Ijumaa, 8am-5pm',
    emergencyLine: 'Dharura: 112',
    
    // FAQ
    howToBook: 'Je, ninavyoweza kutenga miadi?',
    howToBookAnswer: 'Bonyeza "Miadi" kwenye menyu kuu, uchague daktari na wakati unaoufaa, na uthibitishe.',
    howToPay: 'Je, ninalipa vipi?',
    howToPayAnswer: 'Unaweza kulipa kupitia M-Pesa, benki, au NHIF. Nenda kwenye sehemu ya Malipo.',
    howToResults: 'Matokeo yangu ya maabara yako wapi?',
    howToResultsAnswer: 'Matokeo yanapatikana masaa 24 baada ya upimaji. Angalia kwenye "Matokeo ya Maabara".',
    howToNHIF: 'Ninaweza kutumia NHIF?',
    howToNHIFAnswer: 'Ndiyo! Weka nambari yako ya NHIF kwenye wasifu wako na tuthibitishe hali yako.',
  },
  en: {
    title: 'Self-Help Center',
    searchPlaceholder: 'Search for help...',
    close: 'Close',
    categories: 'Categories',
    popularTopics: 'Popular Topics',
    askAI: 'Ask AI Assistant',
    contactSupport: 'Contact Support',
    callUs: 'Call us',
    emailUs: 'Email us',
    helpful: 'Was this helpful?',
    yes: 'Yes',
    no: 'No',
    thankYou: 'Thank you for your feedback!',
    
    // Categories
    appointments: 'Appointments',
    payments: 'Payments & NHIF',
    results: 'Lab Results',
    prescriptions: 'Prescriptions',
    account: 'My Account',
    technical: 'Technical Issues',
    
    // AI Chat
    aiChatTitle: 'Chat with AI Assistant',
    aiPlaceholder: 'Type your question here...',
    send: 'Send',
    aiDisclaimer: 'AI assists, not replaces doctors',
    
    // Support
    supportHours: 'Support Hours: Monday-Friday, 8am-5pm',
    emergencyLine: 'Emergency: 112',
    
    // FAQ
    howToBook: 'How do I book an appointment?',
    howToBookAnswer: 'Tap "Appointments" in the main menu, select your doctor and preferred time, and confirm.',
    howToPay: 'How do I make payments?',
    howToPayAnswer: 'You can pay via M-Pesa, bank transfer, or NHIF. Go to the Payments section.',
    howToResults: 'Where are my lab results?',
    howToResultsAnswer: 'Results are available 24 hours after testing. Check the "Lab Results" section.',
    howToNHIF: 'Can I use NHIF?',
    howToNHIFAnswer: 'Yes! Add your NHIF number in your profile and we will verify your status.',
  },
};

export function SelfHelpCenter({ isOpen, onClose }: SelfHelpCenterProps) {
  const { language, isOffline } = useAppStore();
  const t = translations[language];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; message: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  
  // FAQ Database (offline-first)
  const faqData: HelpArticle[] = [
    {
      id: '1',
      title: t.howToBook,
      category: t.appointments,
      content: t.howToBookAnswer,
      helpful: 245,
      notHelpful: 12,
    },
    {
      id: '2',
      title: t.howToPay,
      category: t.payments,
      content: t.howToPayAnswer,
      helpful: 189,
      notHelpful: 8,
    },
    {
      id: '3',
      title: t.howToResults,
      category: t.results,
      content: t.howToResultsAnswer,
      helpful: 156,
      notHelpful: 5,
    },
    {
      id: '4',
      title: t.howToNHIF,
      category: t.payments,
      content: t.howToNHIFAnswer,
      helpful: 298,
      notHelpful: 15,
    },
  ];
  
  const categories = [
    { name: t.appointments, icon: '📅', count: 12 },
    { name: t.payments, icon: '💳', count: 8 },
    { name: t.results, icon: '🔬', count: 6 },
    { name: t.prescriptions, icon: '💊', count: 9 },
    { name: t.account, icon: '👤', count: 15 },
    { name: t.technical, icon: '⚙️', count: 7 },
  ];
  
  // Filter FAQs based on search
  const filteredFAQs = searchQuery
    ? faqData.filter(
        (faq) =>
          faq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData;
  
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages([
      ...chatMessages,
      { role: 'user', message: chatInput },
      {
        role: 'ai',
        message:
          language === 'sw'
            ? 'Asante kwa swali lako. Nimeelewa unauliza kuhusu huduma zetu. Je,ungependa msaada zaidi?'
            : 'Thank you for your question. I understand you are asking about our services. Would you like more help?',
      },
    ]);
    setChatInput('');
  };
  
  const handleFeedback = (articleId: string, helpful: boolean) => {
    setFeedbackGiven({ ...feedbackGiven, [articleId]: true });
    // In production, send feedback to backend
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E88E5] to-[#43A047] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <HelpCircle className="h-6 w-6 mr-2" />
              {t.title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* AI Chat Section */}
          {!showAIChat ? (
            <Card
              className="mb-6 cursor-pointer hover:shadow-lg transition-shadow border-blue-200 bg-blue-50"
              onClick={() => setShowAIChat(true)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-[#1E88E5] text-white p-3 rounded-full mr-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.askAI}</h3>
                    <p className="text-sm text-gray-600">{t.aiDisclaimer}</p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-[#1E88E5]" />
                    {t.aiChatTitle}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIChat(false)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                  {chatMessages.length === 0 ? (
                    <p className="text-gray-500 text-center mt-20">
                      {language === 'sw'
                        ? 'Uliza swali lolote kuhusu AfyaAI'
                        : 'Ask any question about AfyaAI'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-[#1E88E5] text-white'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.aiPlaceholder}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#1E88E5] hover:bg-[#1976D2]"
                  >
                    {t.send}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t.aiDisclaimer}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          {!searchQuery && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">{t.categories}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category, idx) => (
                  <Card
                    key={idx}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4 text-center">
                      <span className="text-3xl mb-2 block">{category.icon}</span>
                      <h4 className="font-semibold text-sm mb-1">{category.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {category.count} {language === 'sw' ? 'makala' : 'articles'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Popular Topics / Search Results */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Book className="h-5 w-5 mr-2 text-[#43A047]" />
              {searchQuery ? 'Search Results' : t.popularTopics}
            </h3>
            <div className="space-y-3">
              {filteredFAQs.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-xs mb-2">
                          {article.category}
                        </Badge>
                        <h4 className="font-semibold mb-2">{article.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{article.content}</p>
                      </div>
                    </div>
                    
                    {/* Feedback */}
                    {feedbackGiven[article.id] ? (
                      <p className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t.thankYou}
                      </p>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{t.helpful}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(article.id, true)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {t.yes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(article.id, false)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {t.no}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <Card className="border-[#1E88E5] bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-[#1E88E5]">
                <Phone className="h-5 w-5 mr-2" />
                {t.contactSupport}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">{t.supportHours}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  {t.callUs}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {t.emailUs}
                </Button>
              </div>
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-red-900">{t.emergencyLine}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}