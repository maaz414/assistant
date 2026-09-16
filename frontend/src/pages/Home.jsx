import React, { useContext, useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"
import { IoMdSend } from "react-icons/io";
import { FaPaperclip } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import mainImg from "../assets/main.png";
import DesktopIcon from '../components/desktopicon';

function Home() {
  const { userData, serverUrl, setUserData, getAiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const [ham, setHam] = useState(false)
  const isRecognizingRef = useRef(false)
  const [textInput, setTextInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatImage, setChatImage] = useState(null)
  const fileInputRef = useRef(null)
  // New States for UI and Chat History
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [widgetPosition, setWidgetPosition] = useState(null);
  const logoRef = useRef(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const downloadImage = (imgUrl) => {
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `Generated_Image_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVoiceMenuOpen) {
        const clickedDesktop = desktopDropdownRef.current && desktopDropdownRef.current.contains(event.target);
        const clickedMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(event.target);
        if (!clickedDesktop && !clickedMobile) {
          setIsVoiceMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVoiceMenuOpen]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Default to the first found Hindi voice, or fallback
        if (!selectedVoice) {
          const fallbackVoice = availableVoices.find(v => v.lang.includes('hi')) || availableVoices[0];
          setSelectedVoice(fallbackVoice.voiceURI);
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  const [themeIndex, setThemeIndex] = useState(0);

  const getVoiceTone = (voice) => {
    if (!voice) return "Select Tone";
    const name = voice.name.toLowerCase();

    if (name.includes('zira')) return 'Female (Soft)';
    if (name.includes('mark')) return 'Male (Hard)';
    if (name.includes('david')) return 'Male (Gentle)';
    if (name.includes('ravi') || name.includes('aditi')) return 'Indian (Gentle)';
    if (name.includes('madhur')) return 'Indian (Soft)';
    if (name.includes('female')) return 'Voice (Female)';
    if (name.includes('male')) return 'Voice (Male)';

    return 'Standard Tone';
  }

  const displayVoices = voices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('hi')).reduce((acc, current) => {
    const tone = getVoiceTone(current);
    if (!acc.find(item => getVoiceTone(item) === tone)) {
      acc.push(current);
    }
    return acc;
  }, []);

  const themes = [
    { background: 'linear-gradient(to top, #02021c, #02023d)' }, // Original Deep Blue
    { background: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)' }, // Deep Violet/Space
    { background: 'linear-gradient(to right, #141e30, #243b55)' }, // Slate Blue
    { background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' }, // Deep Teal
    { background: 'linear-gradient(to bottom, #16222a, #3a6073)' }, // Steel Blue
    { background: 'linear-gradient(135deg, #1f4037 0%, #305849 100%)' }, // Forest Green Dark
    { background: 'linear-gradient(315deg, #2a2a72 0%, #104e76 74%)' }, // Classic Deep Blue
    { background: 'linear-gradient(to right, #000428, #004e92)' }, // Midnight Blue
    { background: 'linear-gradient(to right, #1a1a2e, #16213e, #0f3460)' }, // Dark Nebula
    { background: 'linear-gradient(to bottom, #131518, #222428)' }, // Abyss
    { background: 'linear-gradient(to bottom, #29323C, #485563)' }, // Dark Ash
    { background: 'linear-gradient(to bottom, #101820, #1E272E)' }, // Onyx
    { background: 'linear-gradient(to right, #051937, #013152)' }, // Sapphire Dark
    { background: 'linear-gradient(to right, #17181a, #2b303a)' }, // Charcoal
    { background: 'linear-gradient(to bottom, #052b31, #0a4d53)' }, // Toxic Dark Green
    { background: 'linear-gradient(to bottom, #000000, #202020)' } // Pure Dark
  ];

  const handleChangeTheme = () => {
    let nextIndex = Math.floor(Math.random() * themes.length);
    while (themes.length > 1 && nextIndex === themeIndex) {
      nextIndex = Math.floor(Math.random() * themes.length);
    }
    setThemeIndex(nextIndex);
  }

  const handleMinimizeToWidget = () => {
    if (logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + window.screenX;
      const y = rect.top + rect.height / 2 + window.screenY;
      setWidgetPosition({ x, y });
      if (window.electronAPI) {
        window.electronAPI.minimizeToWidget({ x, y });
      }
    }
    setIsWidgetMode(true);
  };

  const handleExpandFromWidget = () => {
    setIsWidgetMode(false);
    if (window.electronAPI) {
      window.electronAPI.expandFromWidget();
    }
  };

  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
  }, [chatHistory])

  const addMessage = (text, sender, displayText = null, image = null) => {
    const timeStr = new Date().toLocaleTimeString('en-US');
    setChatHistory(prev => [...prev, { text, sender, timestamp: timeStr, displayText, image }]);
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearHistory = () => {
    setChatHistory([]);
  }

  const synth = window.speechSynthesis

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }



  const handleTextInputSubmit = async (e) => {
    e.preventDefault();
    if ((!textInput.trim() && !chatImage) || isLoading) return;

    setIsLoading(true);

    const currentText = textInput || "Analyze this image.";
    const currentImg = chatImage;

    // Set AI text to "thinking..." immediately so user knows it's working
    setAiText("");
    setUserText(currentText);
    addMessage(currentText, 'user', null, currentImg);
    
    setTextInput("");
    setChatImage(null);

    try {
      if (recognitionRef.current && isRecognizingRef.current) {
        recognitionRef.current.stop();
      }
    } catch (err) {
      console.log("Error stopping recognition on text submit", err);
    }

    try {
      const data = await getAiResponse(currentText, chatHistory, currentImg);
      if (data) {
        handleCommand(data);
        addMessage(data.response || "", 'ai', data.displayText, data.image);
        setAiText(data.response || "");
      }
    } catch (err) {
      console.error("Text submit AI response error:", err);
    } finally {
      setTextInput("");
      setIsLoading(false);
    }
  }

  const startRecognition = () => {

    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        console.log("Recognition requested to start");
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    }

  }

  const speak = (text) => {
    if (!text) return;
    const utterence = new SpeechSynthesisUtterance(text)

    if (selectedVoice) {
      const voice = voices.find(v => v.voiceURI === selectedVoice);
      if (voice) utterence.voice = voice;
    } else {
      utterence.lang = 'hi-IN';
      const builtinVoices = window.speechSynthesis.getVoices()
      const hindiVoice = builtinVoices.find(v => v.lang === 'hi-IN');
      if (hindiVoice) {
        utterence.voice = hindiVoice;
      }
    }


    isSpeakingRef.current = true
    utterence.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition(); // ⏳ Delay se race condition avoid hoti hai
      }, 800);
    }
    utterence.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800);
    }
    synth.cancel(); // 🛑 pehle se koi speech ho to band karo
    synth.speak(utterence);
  }

  const handleCommand = (data) => {
    if (!data) return;
    const { type, userInput, response } = data
    if (response) {
      speak(response);
    }

    if (type === 'google-search') {
      const query = encodeURIComponent(userInput || "");
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
    if (type === 'calculator-open') {

      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }
    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }

    if (type === 'youtube-open') {
      window.open(`https://www.youtube.com`, '_blank');
    }

    if (type === 'whatsapp-open') {
      window.open(`https://web.whatsapp.com`, '_blank');
    }

    if (type === 'youtube-search' || type === 'youtube-play') {
      const queryTrim = (userInput || "").trim();
      if (!queryTrim || queryTrim.toLowerCase() === "youtube" || queryTrim.toLowerCase() === "open youtube") {
        window.open(`https://www.youtube.com`, '_blank');
      } else {
        const query = encodeURIComponent(queryTrim);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
      }
    }

  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true;  // flag to avoid setState on unmounted component

    // Start recognition after 1 second delay only if component still mounted
    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (e) {
          if (e.name !== "InvalidStateError") {
            console.error(e);
          }
        }
      }
    }, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted after error");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      const assistantName = userData?.assistantName?.toLowerCase();
      if (assistantName && transcript.toLowerCase().includes(assistantName)) {
        if (isLoading) return;
        setIsLoading(true);
        
        setAiText("");
        setUserText(transcript);
        addMessage(transcript, 'user');
        try {
          recognition.stop();
        } catch (e) {}
        isRecognizingRef.current = false;
        setListening(false);
        try {
          const data = await getAiResponse(transcript, chatHistory);
          if (data) {
            handleCommand(data);
            addMessage(data.response || "", 'ai', data.displayText, data.image);
            setAiText(data.response || "");
          }
        } catch (err) {
          console.error("Speech AI response error:", err);
        } finally {
          setUserText("");
          setIsLoading(false);
        }
      }
    };


    if (userData?.name) {
      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
      greeting.lang = 'hi-IN';
      window.speechSynthesis.speak(greeting);
    }


    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);




  return (
    <>
      {isWidgetMode && (
        <DesktopIcon
          initialPosition={widgetPosition}
          onExpand={handleExpandFromWidget}
        />
      )}
      <div className={`w-full h-[100vh] overflow-hidden relative transition-all duration-500 flex justify-center items-center ${isWidgetMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={themes[themeIndex]}>

        <div className={`w-full h-full flex flex-col overflow-hidden transition-all duration-500 origin-center scale-100 opacity-100`}>

          {/* Header Area */}
          <div className='w-full flex justify-between items-center px-6 md:px-10 py-6 draggable z-10'>
            <div className='flex items-center gap-3 no-drag'>
              <div className='flex flex-row cursor-pointer' onClick={handleMinimizeToWidget} ref={logoRef}>
                <div className='w-[60px] h-[60px] md:w-[60px] md:h-[60px] rounded-full flex justify-center items-center '>
                  <img src={mainImg} alt="Logo" className='object-cover w-[200%] h-[200%]' />
                </div>
                <div className='flex flex-col text-white font-[600] tracking-[0.2em] text-left  uppercase mt-4 '>
                  <span className='text-[14px] md:text-[18px] leading-none ml-1 text-[rgb(201,162,90)]'>AAZ</span>
                  <span className='text-[14px] md:text-[18px] leading-none ml-1 text-[rgb(201,162,90)]'>OHSIN</span>
                </div>
              </div>

            </div>

            <CgMenuRight className='lg:hidden text-white w-[25px] h-[25px] cursor-pointer' onClick={() => setHam(true)} />

            <div className='hidden lg:flex gap-4 items-center'>

              <div className="relative no-drag" ref={desktopDropdownRef}>
                <button
                  onClick={() => setIsVoiceMenuOpen(!isVoiceMenuOpen)}
                  className="bg-[rgba(255,255,255,0.1)] outline-none border border-[rgba(255,255,255,0.4)] text-white px-4 py-2 rounded-full font-medium text-[14px] md:text-[15px] hover:bg-[rgba(255,255,255,0.2)] transition-colors shadow-lg cursor-pointer flex items-center justify-between w-[160px]"
                >
                  <span className="truncate">{selectedVoice ? getVoiceTone(voices.find(v => v.voiceURI === selectedVoice)) : "Select Tone"}</span>
                  <span className="ml-2 text-[10px]">▼</span>
                </button>

                {isVoiceMenuOpen && (
                  <div className="absolute top-full mt-2 w-[160px] bg-[rgba(255,255,255,0.1)] outline-none rounded-2xl border border-[rgba(255,255,255,0.4)] shadow-lg overflow-hidden flex flex-col z-50">
                    {displayVoices.map((v, i) => (
                      <div
                        key={v.voiceURI}
                        onClick={() => { setSelectedVoice(v.voiceURI); setIsVoiceMenuOpen(false); }}
                        className="px-4 py-3 text-white text-[14px] font-medium  hover:bg-[rgba(255,255,255,0.2)] transition-colors shadow-lg cursor-pointer"
                      >
                        {getVoiceTone(v)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
              className='text-white px-6 py-2 rounded-full font-bold text-[14px] md:text-[15px] transition-all shadow-lg no-drag hover:opacity-90 border border-[rgba(255,255,255,0.2)]'
              style={{ background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' }}
              onClick={handleChangeTheme}
            >
              Change Theme
            </button>
              <button
                className='bg-white text-black px-6 py-2 rounded-full font-medium text-[14px] md:text-[15px] hover:bg-gray-200 transition-colors no-drag'
                onClick={() => navigate("/customize")}
              >
                Customize Assistant
              </button>
              <button
                className='bg-red-500/80 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium text-[14px] md:text-[15px] transition-colors'
                onClick={handleLogOut}
              >
                Logout
              </button>
            </div>
          </div>

          <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000085] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform z-50 no-drag`}>
            <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer' onClick={() => setHam(false)} />
            <button className='min-w-[150px] h-[50px] text-black font-semibold bg-white rounded-full cursor-pointer text-[17px]' onClick={handleLogOut}>Log Out</button>
            <button className='min-w-[150px] h-[50px] text-black font-semibold bg-white rounded-full cursor-pointer text-[17px] px-[20px]' onClick={() => navigate("/customize")}>Customize your Assistant</button>
            <button className='min-w-[150px] h-[50px] font-bold text-white rounded-full cursor-pointer text-[17px] px-[20px] transition-all hover:opacity-90 border border-[rgba(255,255,255,0.2)]' style={{ background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' }} onClick={handleChangeTheme}>Change Theme</button>

            <div className="w-full relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setIsVoiceMenuOpen(!isVoiceMenuOpen)}
                className="w-full h-[50px] px-[20px] bg-[rgba(255,255,255,0.1)] border-2 border-[rgba(255,255,255,0.3)] text-white rounded-full font-semibold text-[17px] outline-none cursor-pointer flex items-center justify-between"
              >
                <span className="truncate">{selectedVoice ? getVoiceTone(voices.find(v => v.voiceURI === selectedVoice)) : "Select Tone"}</span>
                <span className="text-[14px]">▼</span>
              </button>
              {isVoiceMenuOpen && (
                <div className="mt-4 w-full bg-purple-500 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                  {displayVoices.map((v, i) => (
                    <div
                      key={v.voiceURI}
                      onClick={() => { setSelectedVoice(v.voiceURI); setIsVoiceMenuOpen(false); }}
                      className="px-4 py-3 text-white text-[16px] font-semibold hover:bg-purple-600 cursor-pointer border-b border-purple-400/30 flex justify-center last:border-none"
                    >
                      {getVoiceTone(v)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='w-full h-[2px] bg-gray-400'></div>
            <h1 className='text-white font-semibold text-[19px]'>History</h1>

            <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
              {[...(userData?.history || [])].reverse().map((his, idx) => (
                <div key={idx} className='text-gray-200 text-[18px] w-full h-[30px]'>{his}</div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className='flex flex-col w-full h-full px-6 md:px-10 py-4 md:py-8 overflow-y-auto mb-10'>
            <div
              className='relative flex flex-col items-start w-full'
              onMouseEnter={() => setIsPanelOpen(true)}
              onMouseLeave={() => setIsPanelOpen(false)}
            >
              {/* Image Preview Area */}
              {chatImage && (
                <div className="relative mb-2 w-[100px] h-[100px] border border-[rgba(255,255,255,0.4)] rounded-xl overflow-hidden shadow-lg no-drag">
                  <img src={chatImage} className="w-full h-full object-cover" alt="Selected" />
                  <button onClick={() => setChatImage(null)} className="absolute flex justify-center items-center top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold cursor-pointer hover:bg-red-600 transition-colors">X</button>
                </div>
              )}

              {/* Input form */}
              <form
                onSubmit={handleTextInputSubmit}
                className={`flex items-center bg-[rgba(0,0,0,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.4)] rounded-full px-5 py-3 mb-4 transition-all duration-500 ease-in-out no-drag ${isPanelOpen ? 'w-full' : 'w-[280px] md:w-[350px]'}`}
              >
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-300 hover:text-white transition-colors cursor-pointer mr-3">
                  <FaPaperclip size={18} />
                </button>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Try asking me something interesting"
                  className='bg-transparent text-gray-200 outline-none w-full text-[14px] md:text-[15px] placeholder-gray-400 no-drag'
                />
                <button type="submit" className='text-white ml-3 cursor-pointer hover:text-gray-300 transition-colors no-drag p-2'>
                  <IoMdSend size={20} />
                </button>
              </form>

              {/* Lower Area containing Image and Panel */}
              <div className='flex gap-4 relative w-full'>

                {/* Robot Image Container */}
                <div className='w-[280px] md:w-[350px] h-[280px] md:h-[400px] flex-shrink-0 flex justify-center items-center overflow-hidden rounded-3xl md:rounded-[36px] shadow-[0px_0px_20px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] mb-2'>
                  <img src={userData?.assistantImage} alt="" className='h-full w-full object-cover' />
                </div>

                {/* Chat Panel */}
                <div className={`overflow-hidden transition-[max-width,opacity,width,flex] duration-500 ease-in-out z-10 no-drag ${isPanelOpen ? 'max-w-[2000px] flex-1 opacity-100' : 'max-w-[0px] w-0 opacity-0'}`}>
                  <div className="w-full min-w-[300px] h-[280px] md:h-[400px] flex flex-col border border-[rgba(255,255,255,0.2)] rounded-3xl md:rounded-[36px] bg-[rgba(255,255,255,0.05)] backdrop-blur-md p-4 relative shadow-[0px_0px_20px_rgba(0,0,0,0.5)]">

                    {/* History Header and Clear Button */}
                    <div className='flex justify-between items-center mb-2 px-2'>
                      <span className='text-gray-300 font-semibold'>Chat History</span>
                      <button onClick={clearHistory} className="text-xs font-semibold text-white bg-red-500/80 hover:bg-red-600 px-3 py-1 rounded-full z-10 transition-colors no-drag cursor-pointer">Clear History</button>
                    </div>

                    {/* Custom Scrollable Area */}
                    <div className="flex-1 overflow-y-auto mt-2 flex flex-col gap-4 pr-2 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {isLoading && (
                        <div className="max-w-[90%] self-start bg-[rgba(255,255,255,0.15)] p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                           <span className="text-gray-300 text-sm ml-2 font-medium italic">Working on it...</span>
                        </div>
                      )}
                      {[...chatHistory].reverse().map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'max-w-[80%] self-end bg-blue-600' : 'max-w-[90%] self-start bg-[rgba(255,255,255,0.15)]'} p-3 rounded-2xl ${msg.sender === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                          {msg.image && (
                            <div className={`relative group mb-2 w-fit ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                              <img 
                                src={msg.image} 
                                alt="Chat Image" 
                                onClick={() => setFullScreenImage(msg.image)}
                                className="max-w-[200px] max-h-[200px] rounded-md object-cover border border-[rgba(255,255,255,0.2)] cursor-pointer hover:opacity-90 transition-opacity" 
                              />
                              <button 
                                onClick={() => downloadImage(msg.image)}
                                className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Download Image"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              </button>
                            </div>
                          )}
                          {msg.sender === 'ai' && msg.displayText ? (
                            <div className="text-white prose prose-invert prose-sm max-w-full">
                              <ReactMarkdown>{msg.displayText}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-white text-[15px] whitespace-pre-wrap">{msg.text}</p>
                          )}
                          <span className="text-[10px] text-gray-300 mt-1">{msg.timestamp}</span>
                        </div>
                      ))}
                      {chatHistory.length === 0 && (
                        <div className="w-full text-center mt-10 text-gray-400 text-sm">No history yet.</div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
              <h1 className={`text-white text-[17px] font-semibold pl-2 tracking-wide transition-opacity duration-300 mt-2 ${isPanelOpen ? 'opacity-0' : 'opacity-100 absolute bottom-[-30px]'}`}>
                I'm {userData?.assistantName}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 no-drag">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button 
              onClick={() => setFullScreenImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 cursor-pointer bg-black/40 rounded-full"
            >
              <RxCross1 size={24} />
            </button>
            <img src={fullScreenImage} alt="Fullscreen" className="max-w-full max-h-[80vh] rounded-lg object-contain shadow-2xl" />
            <button 
              onClick={() => downloadImage(fullScreenImage)}
              className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold transition-colors cursor-pointer shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download High Quality
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Home