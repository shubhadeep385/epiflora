# EpiFlora (कृषि-नोड)

### Multimodal, Voice-First Agricultural Intelligence for Smallholder Farmers across BRICS Nations

**Event:** Build with AI: Code for Communities — Second Edition

**Track:** Track 04: AgriN & Regenerative Agricultural Intelligence — BRICS Cooperation

**Team:** TeamAstra

**Team Members:** 
 - [Shubhadeep Mukherjee](https://github.com/shubhadeep385)
 - [Sriraj Gangdeb]()
 - [Manisha Pathy](https://github.com/manishapathy06)
 - [Rani Dynna Pathy]()

**Project:** EpiFlora (कृषि-नोड)

## Overview

EpiFlora is a voice-first, multimodal agricultural intelligence platform designed to make advanced agricultural technology accessible to smallholder farmers across BRICS nations. The platform combines Google Gemini multimodal AI, Sarvam AI voice technology, deterministic environmental algorithms, and regenerative farming knowledge into a single farmer-friendly system.

Instead of requiring farmers to navigate complex, text-heavy applications, EpiFlora allows them to interact naturally: they can photograph a crop leaf, ask a question using their voice, and receive actionable agricultural guidance in familiar languages and code-mixed rural speech. The platform is designed around accessibility, speed, safety, and explainability.

## Inspiration

Smallholder farmers across emerging economies contribute significantly to global food production, yet many remain underserved by modern digital agricultural tools. Existing solutions can be difficult to use because they depend heavily on literacy, English-language interfaces, expensive infrastructure, or fragmented information.

EpiFlora was created around a simple idea: **agricultural intelligence should work the way farmers communicate—not the other way around.**

A farmer should be able to point a phone at an infected leaf and immediately understand what may be affecting the crop. They should also be able to ask questions in their native language or a local code-mixed dialect and receive understandable guidance. By combining multimodal AI with deterministic environmental and soil models, EpiFlora aims to bridge the gap between advanced technology and real-world farming conditions.

## What EpiFlora Does

EpiFlora consists of several interconnected intelligence engines.

### 1. Multimodal Crop Doctor

The Crop Doctor uses Google Gemini's multimodal capabilities to analyze crop images and identify visible disease patterns such as lesion characteristics, margins, discoloration, and necrosis. It can classify potential conditions such as Early Blight, Powdery Mildew, and Leaf Curl, while providing confidence information and practical management guidance.

The system emphasizes organic-first and safer agricultural interventions rather than blindly generating chemical recommendations.

### 2. Voice-First Kisan Copilot

EpiFlora integrates Sarvam AI's Saaras v3 speech recognition and Bulbul v3 text-to-speech technologies with Gemini. This enables farmers to communicate through voice in Hindi, English, and code-mixed rural speech.

The voice pipeline combines speech recognition, agricultural reasoning, and speech synthesis into a streamlined backend flow, targeting approximately 9.4 seconds of end-to-end processing.

### 3. Deterministic Weather & Fungal Risk Engine

Rather than relying entirely on an LLM for environmental predictions, EpiFlora uses real-time weather information from Open-Meteo and applies deterministic agricultural heuristics.

Factors such as prolonged humidity above 80% and precipitation patterns are used to estimate fungal proliferation risk and generate irrigation-related advisories. This provides a more transparent foundation for environmental recommendations.

### 4. Soil Limiting Factor Engine

The platform implements **Liebig's Law of the Minimum** to identify the potentially limiting macronutrient among nitrogen, phosphorus, and potassium.

It also categorizes soil into six agronomic pH bands, helping identify potential nutrient availability and lockout concerns. This creates an algorithmic layer that complements the generative AI system.

### 5. BRICS Cross-Border Agricultural Network

EpiFlora introduces an interoperable agricultural knowledge structure designed around cross-border cooperation.

The system models agricultural information from major agro-ecological hubs including Maharashtra, Mato Grosso, Free State, Henan, and Krasnodar Krai. This can support standardized pest surveillance, regenerative farming knowledge exchange, and agricultural intelligence sharing across regions.

### 6. Safety Guardrails

Agricultural AI can become risky when generated advice includes incorrect chemical concentrations or application rates. EpiFlora therefore implements mechanical post-processing guardrails that detect and remove numerical agrochemical dosage recommendations.

Instead, the system prioritizes safer alternatives and directs farmers toward certified product instructions and appropriate local guidance.

## Technology & Architecture

EpiFlora is built using a modern web architecture consisting of **React 19, TypeScript, TailwindCSS, Lucide Icons, Zustand, and Vite** on the frontend.

The backend uses **Hono and Node.js**, providing a lightweight API architecture suitable for local deployment and serverless/cloud environments such as Vercel or Google Cloud Run.

Google Gemini serves as the central multimodal intelligence layer, handling visual analysis, image-quality assessment, structured agricultural reasoning, and contextual responses. Structured JSON schemas and defensive model parameters are used to make AI outputs more predictable.

The voice layer uses **Sarvam AI Saaras v3 for speech-to-text and Bulbul v3 for text-to-speech**, including support for code-mixed speech.

Environmental intelligence is deliberately separated from generative reasoning where possible. Weather information and agricultural heuristics are calculated algorithmically, reducing dependence on unsupported model assumptions.

The platform also incorporates a four-tier resilience architecture:

**Google Gemini → OpenRouter Gemma Vision → Ollama Local → Seeded Demo Engine**

This fallback cascade allows the application to remain demonstrable even when a primary AI service becomes unavailable.

## Challenges & Solutions

One major challenge was latency. Combining speech recognition, image processing, weather enrichment, LLM reasoning, and speech synthesis through separate client requests resulted in delays exceeding 20 seconds. EpiFlora addressed this by moving the workflow into a consolidated server-side pipeline and parallelizing independent operations, reducing the target end-to-end voice experience to under 10 seconds.

Another challenge was unsafe AI-generated agrochemical advice. Instead of relying solely on prompting, the team implemented deterministic regex-based post-processing to remove numerical chemical dosages.

Dialect and code-mixing also presented challenges. Rural agricultural conversations often mix local languages with English terminology. Sarvam Saaras v3 was therefore integrated with code-mixing support to improve recognition of colloquial agricultural speech.

## Accomplishments

The team successfully developed a multimodal agricultural platform combining AI with deterministic environmental intelligence. Key achievements include rapid visual crop analysis, a single-round-trip voice pipeline, algorithmic weather and soil reasoning, a four-level AI fallback architecture, and mechanical safety guardrails designed to prevent unsafe chemical dosage hallucinations.

The project demonstrates how probabilistic AI can be combined with deterministic models to build more grounded agricultural applications.

## Key Learnings

The team learned that effective AI systems for high-impact domains should not depend exclusively on generative models. Combining AI with deterministic algorithms can improve transparency, consistency, and safety.

The project also reinforced the importance of voice-first interfaces for digital inclusion, particularly in regions where literacy and language barriers can prevent farmers from benefiting from conventional software.

Finally, developing EpiFlora introduced the team to interoperable agricultural data structures and the potential of Digital Public Goods for cross-border agricultural cooperation.

## Future Roadmap

EpiFlora's future roadmap focuses on increasing accessibility, geographic coverage, and real-world deployment.

The team plans to explore **on-device inference** using quantized models on affordable Android devices, enabling offline field diagnostics. Google Earth Engine integration could provide satellite-derived NDVI, vegetation health, and soil-moisture intelligence.

The platform will also expand its voice capabilities across Portuguese, Mandarin, Russian, Zulu, and Afrikaans to support broader BRICS participation.

Finally, the team plans to explore partnerships with **Krishi Vigyan Kendras and Farmer Producer Organizations**, beginning with potential pilot deployments in rural Maharashtra.

## Vision

EpiFlora's long-term vision is to create an agricultural intelligence layer that is **multimodal, multilingual, locally grounded, environmentally aware, and accessible to farmers regardless of technical literacy.**

By combining Google AI, regional voice technology, deterministic agricultural science, and interoperable BRICS-focused knowledge structures, EpiFlora aims to turn a farmer's smartphone into a practical agricultural intelligence companion—helping farmers understand crop health, environmental risk, soil limitations, and regenerative practices through a simple, natural interface.
