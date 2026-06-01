# 🧠 Idea Scout — Automated Virality Engine

This document outlines the visual architecture of the automated content system we have built, tailored to your exact Trigger.dev, Notion, and OpenRouter stack.

## 📊 Tailored System Architecture

Below is the Mermaid representation of the pipeline. If you copy this code block, you can import it directly into **Excalidraw** using their `Insert -> Mermaid` tool to generate an instantly editable and styled diagram!

```mermaid
graph TD
    %% Styling
    classDef title fill:#1e1e2e,stroke:#cba6f7,stroke-width:3px,color:#cba6f7,font-weight:bold;
    classDef step fill:#313244,stroke:#89b4fa,stroke-width:2px,color:#cdd6f4;
    classDef voice fill:#45475a,stroke:#f38ba8,stroke-width:2px,color:#f38ba8;
    classDef output fill:#11111b,stroke:#a6e3a1,stroke-width:3px,color:#a6e3a1,font-weight:bold;

    %% Diagram Header
    Title["🧠 IDEA SCOUT AUTOMATION ENGINE<br/>(How We Reverse-Engineer & Automate Virality)"]:::title

    %% Flow Steps
    S1["1. FOCUS NICHE ID<br/><i>Define target creators & active niches in Notion</i>"]:::step
    S2["2. MULTI-SOURCE SCRAPE<br/><i>Trigger.dev orchestrator pulls from YT, IG, & X API</i>"]:::step
    S3["3. AI DISAMBIGUATION FILTER<br/><i>Analyze relevance, discard noise, freeze Web3/Psychology</i>"]:::step
    S4["4. 📚 VIRAL PLAYBOOK<br/><i>Notion Library codifies successful structures & hook templates</i>"]:::step
    S5["5. 🎙️ DUAL-VOICE LAYER<br/><i>Inject 'Smart Friend' peer voice or 'Curator-Analyst' deconstruction</i>"]:::step
    S6["6. 🤖 PARALLEL SYNTHESIS<br/><i>Cross-pollinate raw ideas with playbook formats in parallel</i>"]:::step

    %% Flow Connections
    Title --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4
    S4 --> S5
    S5 --> S6

    %% Voice Sub-branches
    S5 --> V1["Smart Friend (Default)<br/>• First-person retrospective<br/>• Short. Breathe. Land.<br/>• Emotional friction & real metrics"]:::voice
    S5 --> V2["Curator-Analyst (2/5 Floor)<br/>• Third-person builder spotlight<br/>• Step-by-step deconstruction<br/>• Highlight external creators/tools"]:::voice

    %% Output
    S6 --> Out["🏆 OUTPUT: IDEAS BANK DRAFTS<br/>Proven Structures + Active Niche + Dual Voice Mode = Performance"]:::output

    %% Class assignment
    class Title title;
    class S1,S2,S3,S4,S5,S6 step;
    class V1,V2 voice;
    class Out output;
```

---

## ⚙️ How the 6 Steps Map to Our Codebase

### 1. Focus Niche ID
* **Notion Database:** `Focus Creators`
* **Tailored Mapping:** Instead of generic target handles, your system groups creators into active content pillars (niches). Outdated niches (like **Web3** and **Psychology**) are automatically filtered out during active runs.

### 2. Multi-Source Scrape
* **Scraper Engine:** Trigger.dev Orchestrator (`scout-content.ts`)
* **Tailored Mapping:** 
  * **YouTube:** Sequential creator scraping + transcript mapper in `src/lib/apify.ts`.
  * **Instagram:** official Reel scraper pulling the top 5 freshest + 5 most viral Reels.
  * **X (Twitter):** High-speed direct search REST API (`twitterapi.io`) running a throttled 5.5s loop to stay under rate limits.

### 3. AI Disambiguation Filter
* **Filtering Pipeline:** `process-content.ts`
* **Tailored Mapping:** An active LLM evaluates confidence scores ($\ge 0.6$) and eliminates common keyword collisions (e.g. discarding athlete/driver name overlaps and focusing exclusively on tech, vibe coding, automation, and builder topics).

### 4. 📚 Viral Playbook
* **Notion Database:** `📚 Viral Post Library`
* **Tailored Mapping:** Codifies real high-performing structures, ratings ($4\star$ and $5\star$), hook categories, and steal-able layouts derived from our manual research pipeline.

### 5. 🎙️ Dual-Voice Layer
* **Prompt Framework:** `src/lib/llm.ts` & `src/trigger/idea-scout/draft-ideas.ts`
* **Tailored Mapping:**
  * **Smart Friend (Default):** First-person retrospect, "Short. Breathe. Land." spacing, and concrete metric formatting ($65,897 over "$65k").
  * **Curator-Analyst (Floor of 2/5):** Third-person builder breakdowns that dissect exactly *how* a successful tool was built or a milestone was hit.

### 6. Parallel Synthesis
* **Creative Runner:** `draft-ideas.ts`
* **Tailored Mapping:** Groups scouted raw posts, pulls matching playbook templates, fires parallel OpenRouter prompts chunked to a concurrency of 3, normalizes output JSON using our custom `repairJson()` helper, and writes drafts cleanly to your Notion Ideas Bank with a throttled 350ms delay.
