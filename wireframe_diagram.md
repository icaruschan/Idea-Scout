# 🧠 Idea Scout — Core Feature & Value Map

This document outlines the user-facing feature map for the **Idea Scout** agentic workspace.

*   **Interactive Excalidraw Diagrams**:
    *   🔵 [Circle Features Version](https://excalidraw.com/#json=Au20X6e1JTVNxwsR712ZY,cGYoez5njXerUwcJuSoU-w) 
    *   ⬜ [Rectangle Features Version](https://excalidraw.com/#json=R_wmTfjZZwW4SBD8_gxaj,7rnQ8w-FECXdNaHO7PhnNA) (Fully updated with spacious 300x150 rounded rectangles and comfortable arrow spacing)

Open the **Markdown Preview** in your IDE to see the Mermaid diagram version.

---

## 🌟 Diagram Layout (5-Spoke Pentagonal Star)

```mermaid
graph TD
    %% Styling
    classDef hub fill:#d0bfff,stroke:#8b5cf6,stroke-width:3px,font-size:18px;
    classDef feature fill:#a5d8ff,stroke:#4a9eed,stroke-width:2px;
    
    %% Central Hub
    Hub(("🧠 IDEA SCOUT<br/>(Agentic Content Hub)")):::hub

    %% 5 Feature Spokes pointing inward
    F1["📚 Access to over 500+ viral tweet structures, hooks, and patterns"]:::feature --> Hub
    F2["📡 Scouts content of top creators from X, YouTube, and Instagram"]:::feature --> Hub
    F3["✍️ Drafts potential tweet ideas from scouted content"]:::feature --> Hub
    F4["🎯 Tailored to your content pillars"]:::feature --> Hub
    F5["⚙️ Fully autonomous workflow"]:::feature --> Hub

    %% Apply classes
    class Hub hub;
```
