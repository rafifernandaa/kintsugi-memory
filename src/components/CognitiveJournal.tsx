import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Languages,
  Calendar,
  Mic,
  CheckCircle2,
  PenLine,
  Brain,
  Tag,
  Search,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Concept } from '../types';

interface JournalEntry {
  id: string;
  title: string;
  category: 'language' | 'academic' | 'reflection' | 'speaking';
  targetLanguage?: string;
  tags: string[];
  content: string;
  createdAt: string;
  goldInsights?: string[];
}

interface CognitiveJournalProps {
  concepts: Concept[];
  onStartReviewForConcept?: (concept: Concept) => void;
  onAddTelemetry: (action: string, details: string, role?: any) => void;
  onOpenDailySummary?: () => void;
}

const DEFAULT_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry_1',
    title: 'Japanese Kanji & Grammar Nuances: 〜わけにはいかない vs 〜ざるを得ない',
    category: 'language',
    targetLanguage: 'Japanese (日本語)',
    tags: ['JLPT N2/N1', 'Grammar Invariant', 'Vocabulary'],
    content: `## Key Grammar Boundary
- **〜わけにはいかない (Wake ni wa ikanai)**: Social/psychological obligation or moral impossibility.
  * Example: 明日は試験があるから、休むわけにはいかない。(I have an exam tomorrow, so I cannot afford to skip it.)
- **〜ざるを得ない (Zaru wo enakatta / Zaru wo enai)**: Physical/unavoidable logical necessity ("cannot help but", no alternative).
  * Example: 雨がひどいので、イベントを中止せざるを得ない。(Because of the torrential rain, we have no choice but to cancel the event.)

### Synaptic Mnemonic
*Wake* = reason/context. *Zaru* = negative form, forcing the inevitable path.`,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    goldInsights: [
      'Discovered that passive flashcard recognition failed to test the social vs physical necessity distinction in sentence construction.',
    ],
  },
  {
    id: 'entry_2',
    title: 'Spanish Subjunctive Triggers & WEIRDO Framework',
    category: 'language',
    targetLanguage: 'Spanish (Español)',
    tags: ['Subjunctive', 'Sentence Structure', 'C1 Fluency'],
    content: `## The WEIRDO Trigger Rule
When expressing **W**ishes, **E**motions, **I**mpersonal expressions, **R**ecommendations, **D**oubt, or **O**jalá:
- Switch root vowel: *Hablar* -> *hable*, *Comer* -> *coma*.
- Invariant: When the subject of both clauses is identical, use infinitive instead of subjunctive (*Quiero ir* vs *Quiero que vayas*).`,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    goldInsights: [
      'Pronunciation fluency improved when speaking entire subordinate clauses in one rhythmic breath.',
    ],
  },
  {
    id: 'entry_3',
    title: 'Distributed State Invariants & Long-Term Synaptic Consolidation',
    category: 'academic',
    tags: ['Distributed Systems', 'Cognitive Science'],
    content: `Reflecting on quorum intersection (R + W > N). The beauty of Kintsugi aligns with distributed consensus: the moment a network partition splits, you do not conceal the partition; you fence the minority and reconstruct state monotonically.`,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    goldInsights: [
      'Active scenario-based self-explanation creates 3x more stability than re-reading lecture slide bullets.',
    ],
  },
];

const AI_PROMPTS = [
  {
    title: 'Language Sentence Builder',
    category: 'language' as const,
    prompt: 'Synthesize 3 new conversational sentences applying recent vocabulary and grammar invariants:',
  },
  {
    title: 'Misconception Deconstruction',
    category: 'reflection' as const,
    prompt: 'What subtle nuance or false assumption did I clarify today during retrieval practice?',
  },
  {
    title: 'Speaking & Pronunciation Reflection',
    category: 'speaking' as const,
    prompt: 'Reflect on vocal rhythm, intonation patterns, and spoken fluency during today Socratic session:',
  },
  {
    title: 'Cross-Discipline Connection',
    category: 'academic' as const,
    prompt: 'How does today concept connect to an adjacent mental model or real-world problem?',
  },
];

export const CognitiveJournal: React.FC<CognitiveJournalProps> = ({
  concepts,
  onStartReviewForConcept,
  onAddTelemetry,
  onOpenDailySummary,
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('kintsugi_journal_entries');
      return saved ? JSON.parse(saved) : DEFAULT_JOURNAL_ENTRIES;
    } catch {
      return DEFAULT_JOURNAL_ENTRIES;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<JournalEntry['category']>('language');
  const [newLanguage, setNewLanguage] = useState('Japanese (日本語)');
  const [newTags, setNewTags] = useState('Vocabulary, Grammar');
  const [newContent, setNewContent] = useState('');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kintsugi_journal_entries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveNewEntry = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const entry: JournalEntry = {
      id: `journal_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetLanguage: newCategory === 'language' || newCategory === 'speaking' ? newLanguage.trim() : undefined,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      content: newContent.trim(),
      createdAt: new Date().toISOString(),
      goldInsights: [],
    };

    setEntries([entry, ...entries]);
    setIsCreating(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('Vocabulary, Grammar');

    onAddTelemetry(
      'Journal Entry Created',
      `Saved entry "${entry.title}" in category [${entry.category.toUpperCase()}].`,
      'Journal Scribe',
      'success'
    );
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      setEntries(entries.filter((e) => e.id !== id));
      onAddTelemetry('Journal Entry Deleted', `Deleted journal entry ${id}.`, 'Journal Scribe');
    }
  };

  const handleUsePrompt = (promptText: string, cat: JournalEntry['category']) => {
    setIsCreating(true);
    setNewCategory(cat);
    setNewContent((prev) => (prev ? `${prev}\n\n### ${promptText}\n` : `### ${promptText}\n`));
  };

  const filteredEntries = entries.filter((e) => {
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Calculate Language and Concept Stats
  const languageEntriesCount = entries.filter((e) => e.category === 'language' || e.category === 'speaking').length;
  const totalGoldInsights = entries.reduce((acc, e) => acc + (e.goldInsights?.length || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#BF9A2A]/10 via-[#FAF3E0]/40 to-transparent rounded-full pointer-events-none blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8F6A00] font-semibold tracking-wider">
              <BookOpen className="w-4 h-4 text-[#BF9A2A]" /> Philosophical & Cognitive Learning Journal
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenDailySummary && (
                <button
                  onClick={onOpenDailySummary}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] hover:text-[#2B2827] border border-[#DDD7C8] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" />
                  <span>View Daily Synaptic Summary</span>
                </button>
              )}

              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#BF9A2A]" />
                <span>New Reflection Entry</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2B2827] tracking-tight">
              Cognitive Synthesis & Polyglot Learning Journal
            </h1>
            <p className="text-sm text-[#5A5553] max-w-3xl leading-relaxed mt-1.5">
              Reflect on newly acquired concepts, foreign language vocabulary, grammatical structures, and speech nuances. Just as Kintsugi marks the fracture with gold, your journal documents where cognitive boundaries were challenged and consolidated.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] font-mono text-[#736D6B] uppercase font-semibold">Total Journal Logs</span>
              <div className="text-xl font-bold font-mono text-[#2B2827]">{entries.length}</div>
            </div>
            <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] font-mono text-[#736D6B] uppercase font-semibold">Language Mastery Logs</span>
              <div className="text-xl font-bold font-mono text-[#8F6A00] flex items-center gap-1.5">
                <Languages className="w-4 h-4" /> {languageEntriesCount}
              </div>
            </div>
            <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] font-mono text-[#736D6B] uppercase font-semibold">Active Memory Vessels</span>
              <div className="text-xl font-bold font-mono text-[#2F6A38]">{concepts.length}</div>
            </div>
            <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] font-mono text-[#736D6B] uppercase font-semibold">Golden Seam Insights</span>
              <div className="text-xl font-bold font-mono text-[#BF9A2A] flex items-center gap-1.5">
                <Award className="w-4 h-4" /> {totalGoldInsights}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Inspiration & Prompt Starters */}
      <div className="bg-[#FAF8F2] border border-[#DDD7C8] rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8F6A00] font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#BF9A2A]" /> Guided Reflection & Language Building Prompts
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {AI_PROMPTS.map((p, idx) => (
            <div
              key={idx}
              onClick={() => handleUsePrompt(p.prompt, p.category)}
              className="bg-[#FFFFFF] border border-[#DDD7C8] hover:border-[#BF9A2A] rounded-2xl p-4 space-y-2 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2B2827] group-hover:text-[#8F6A00] transition-colors">
                    {p.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#FAF3E0] text-[#8F6A00] font-semibold">
                    {p.category}
                  </span>
                </div>
                <p className="text-xs text-[#5A5553] italic leading-relaxed">
                  "{p.prompt}"
                </p>
              </div>

              <div className="text-[11px] font-mono text-[#BF9A2A] font-semibold flex items-center gap-1 pt-2">
                <span>Use Prompt</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Entry Modal / Form */}
      {isCreating && (
        <div className="bg-[#FFFFFF] border-2 border-[#BF9A2A] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-[#DDD7C8] pb-3">
            <div className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-[#8F6A00]" />
              <h2 className="text-lg font-serif font-bold text-[#2B2827]">
                Compose Cognitive & Language Reflection
              </h2>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs font-mono text-[#736D6B] hover:text-[#2B2827] px-2.5 py-1 rounded-lg hover:bg-[#FAF8F2] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-mono font-bold text-[#2B2827]">
                Entry Title / Topic
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Japanese Conditional Invariants (と vs ば vs たら vs なら)"
                className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl px-3.5 py-2.5 text-xs font-sans text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-[#2B2827]">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl px-3.5 py-2.5 text-xs font-sans text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
              >
                <option value="language">Language & Vocabulary</option>
                <option value="speaking">Speaking & Pronunciation</option>
                <option value="academic">Academic & Engineering</option>
                <option value="reflection">Philosophical Reflection</option>
              </select>
            </div>
          </div>

          {(newCategory === 'language' || newCategory === 'speaking') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-[#2B2827]">
                  Target Language
                </label>
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="e.g. Japanese (日本語), Spanish, French, Mandarin"
                  className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl px-3.5 py-2.5 text-xs font-sans text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-[#2B2827]">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Vocabulary, Subjunctive, Sentence Structure"
                  className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl px-3.5 py-2.5 text-xs font-sans text-[#2B2827] focus:outline-none focus:border-[#BF9A2A]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-mono font-bold text-[#2B2827]">
              Reflection Notes & Invariants (Markdown supported)
            </label>
            <textarea
              rows={8}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your vocabulary sentences, grammatical rules, spoken dialogue observations, or core conceptual breakthroughs..."
              className="w-full bg-[#FAF8F2] border border-[#DDD7C8] rounded-xl p-4 text-xs font-sans text-[#2B2827] focus:outline-none focus:border-[#BF9A2A] leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6D6] text-[#5A5553] text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNewEntry}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#152659] hover:bg-[#1E357A] text-white text-xs font-mono font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#BF9A2A]" />
              Save to Journal
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD7C8] pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Reflections' },
            { id: 'language', label: 'Language & Vocab' },
            { id: 'speaking', label: 'Speaking & Pronunciation' },
            { id: 'academic', label: 'Academic Concepts' },
            { id: 'reflection', label: 'Philosophical' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#152659] text-white shadow-xs'
                  : 'bg-[#FAF8F2] text-[#5A5553] hover:bg-[#EAE6D6] hover:text-[#2B2827] border border-[#DDD7C8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#736D6B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries or tags..."
            className="w-full bg-[#FFFFFF] border border-[#DDD7C8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2B2827] placeholder:text-[#736D6B] focus:outline-none focus:border-[#BF9A2A]"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DDD7C8] rounded-3xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#BF9A2A] mx-auto opacity-70" />
            <h3 className="text-base font-serif font-bold text-[#2B2827]">
              No Journal Reflections Found
            </h3>
            <p className="text-xs text-[#736D6B] max-w-md mx-auto">
              Create your first language vocabulary log, grammar structure reflection, or cognitive insight above.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 rounded-xl bg-[#152659] text-white text-xs font-mono font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#BF9A2A]" /> Create First Entry
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#FFFFFF] border border-[#DDD7C8] hover:border-[#BF9A2A]/60 rounded-3xl p-6 shadow-sm space-y-4 transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#DDD7C8] pb-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#FAF3E0] text-[#8F6A00] font-bold border border-[#E8D4A2]">
                      {entry.category}
                    </span>
                    {entry.targetLanguage && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F0F7F1] text-[#2F6A38] font-bold border border-[#BFE0C4] flex items-center gap-1">
                        <Languages className="w-3 h-3" /> {entry.targetLanguage}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-[#736D6B] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#2B2827]">
                    {entry.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1.5 rounded-xl hover:bg-[#FDF2F0] text-[#736D6B] hover:text-[#993B2B] transition-colors cursor-pointer"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="text-xs text-[#2B2827] leading-relaxed font-sans whitespace-pre-line space-y-2 bg-[#FAF8F2] p-4 rounded-2xl border border-[#DDD7C8]">
                {entry.content}
              </div>

              {/* Golden Seam Insights */}
              {entry.goldInsights && entry.goldInsights.length > 0 && (
                <div className="bg-[#FAF3E0] border border-[#E8D4A2] rounded-2xl p-3.5 space-y-1.5">
                  <div className="text-[11px] font-mono text-[#8F6A00] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#BF9A2A]" /> Golden Seam Invariant
                  </div>
                  {entry.goldInsights.map((insight, idx) => (
                    <p key={idx} className="text-xs text-[#5A5553] italic font-serif leading-relaxed">
                      "{insight}"
                    </p>
                  ))}
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <Tag className="w-3 h-3 text-[#736D6B]" />
                  {entry.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-[#FAF8F2] text-[#5A5553] px-2 py-0.5 rounded-md border border-[#DDD7C8]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
