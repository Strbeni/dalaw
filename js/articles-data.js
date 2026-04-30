/**
 * Articles Data Store
 * Manages both legacy (seeded) and dynamically added articles.
 * Supports multi-language content (EN / JP).
 * Storage: localStorage key "da_articles"
 */
var ArticlesStore = (function () {
    'use strict';

    var STORAGE_KEY = 'da_articles';

    // ── Seed data (existing static articles) ─────────────────────────
    var SEED_ARTICLES = [
        {
            id: 'enhancing-information-security',
            category: 'indo-japan',
            image: 'images/article/Article1.jpg',
            date: '2024-11-02',
            author: 'Admin',
            legacySlug: "Enhancing information security an overview of rbi's directions.html",
            content: {
                en: {
                    title: "Enhancing information security: an overview of RBI's directions",
                    description: "The landscape of financial regulations is ever-evolving, driven by the need to adapt to emerging threats and technological advancements...",
                    body: ''
                },
                jp: {
                    title: '情報セキュリティの強化：RBI指令の概要',
                    description: '金融規制の状況は、新たな脅威や技術の進歩に適応する必要性に駆られ、常に進化しています...',
                    body: ''
                }
            }
        },
        {
            id: 'guidelines-dark-patterns-2023',
            category: 'indo-us',
            image: 'images/article/Article2.jpg',
            date: '2024-07-28',
            author: 'Admin',
            legacySlug: 'Guidelines for prevention and regulation of dark patterns, 2023.html',
            content: {
                en: {
                    title: 'Guidelines for prevention and regulation of dark patterns, 2023',
                    description: 'In the rapidly evolving landscape of the digital age, where online commerce has become an integral ...',
                    body: ''
                },
                jp: {
                    title: 'ダークパターンの防止と規制に関するガイドライン、2023年',
                    description: 'オンラインコマースが不可欠となったデジタル時代の急速に進化する状況において...',
                    body: ''
                }
            }
        },
        {
            id: 'strengthening-creators-rights',
            category: 'indo-europe',
            image: 'images/article/Article3.jpg',
            date: '2024-04-12',
            author: 'Admin',
            legacySlug: "Strengthening creators' rights unveiling the john doe order.html",
            content: {
                en: {
                    title: "Strengthening creators' rights: unveiling the john doe order",
                    description: "The John Doe order is like a shield for creators' intellectual property rights, especially in cases where the infringers involved are unidentified...",
                    body: ''
                },
                jp: {
                    title: 'クリエイターの権利強化：ジョン・ドー命令の公開',
                    description: 'ジョン・ドー命令は、特に侵害者が特定されていない場合に、クリエイターの知的財産権を守る盾のようなものです...',
                    body: ''
                }
            }
        },
        {
            id: 'fintech-self-regulatory-organizations',
            category: 'indo-japan',
            image: 'images/article/Article4.jpg',
            date: '2024-02-01',
            author: 'Admin',
            legacySlug: 'Draft framework for fintech self - regulatory organizations comprehensive overview.html',
            content: {
                en: {
                    title: 'Draft framework for fintech self - regulatory organizations: comprehensive overview',
                    description: 'In recent years, the financial technology ("FinTech") sector has undergone remarkable expansion, reshaping the landscape of financial...',
                    body: ''
                },
                jp: {
                    title: 'フィンテック自主規制機関の枠組み草案：包括的概要',
                    description: '近年、フィンテック部門は著しい拡大を遂げ、金融の状況を再形成しています...',
                    body: ''
                }
            }
        },
        {
            id: 'digital-rupee-cbdc',
            category: 'indo-us',
            image: 'images/article/Article5.jpg',
            date: '2023-11-23',
            author: 'Admin',
            legacySlug: "Digital rupee(e₹)as india’s central bank digital currency.html",
            content: {
                en: {
                    title: "Digital rupee(e₹) as india's central bank digital currency",
                    description: "The Reserve Bank of India (RBI) unveiled its plans for a Digital Rupee (e₹) through a series of press releases in October and November 2022. On October 7, 2022; the RBI issued a Conceptual Note on the Central Bank Digital Currency (CBDC)...",
                    body: ''
                },
                jp: {
                    title: 'デジタルルピー（e₹）：インドの中央銀行デジタル通貨',
                    description: 'インド準備銀行（RBI）は、2022年10月と11月に一連のプレスリリースを通じてデジタルルピー（e₹）の計画を発表しました...',
                    body: ''
                }
            }
        },
        {
            id: 'navigating-data-privacy-regime',
            category: 'indo-europe',
            image: 'images/article/Article6.jpg',
            date: '2023-08-17',
            author: 'Admin',
            legacySlug: "Navigating jurisdictional intersection in india's data privacy regime.html",
            content: {
                en: {
                    title: "Navigating Jurisdictional Intersection in India's Data Privacy Regime",
                    description: "Due to technological advancements in the digital era and the virtualization of everything, the need for safeguarding personal data became essential. TheApex Court's ruling in Justice K.S. Puttaswamy (Retd.) & Anr. vs. Union of India & Ors...",
                    body: ''
                },
                jp: {
                    title: 'インドのデータプライバシー制度における管轄権の交差点',
                    description: 'デジタル時代の技術的進歩とあらゆるものの仮想化により、個人データの保護が不可欠になりました...',
                    body: ''
                }
            }
        }
    ];

    // --- Supabase Config ---
    var SUPABASE_URL = 'https://fgsnwktexkvhiclvxckz.supabase.co';
    var SUPABASE_ANON_KEY = 'sb_publishable_oBjpmqrzZpxo8zrCzfQkrA_D7wLigGL';
    var supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

    // ── Helpers ───────────────────────────────────────────────────────

    async function _loadFromDB() {
        if (!supabaseClient) return [];
        var { data, error } = await supabaseClient.from('articles').select('*');
        if (error) {
            console.error('Error fetching articles from Supabase:', error);
            return [];
        }
        return data || [];
    }

    /** Merge seed + dynamic; dynamic articles override seeds with same id */
    async function getAll() {
        var dynamic = await _loadFromDB();
        var merged = SEED_ARTICLES.slice(); // clone seeds
        var seedIds = {};
        for (var i = 0; i < merged.length; i++) {
            seedIds[merged[i].id] = i;
        }
        for (var j = 0; j < dynamic.length; j++) {
            var art = dynamic[j];
            // map legacySlug if stored as legacy_slug
            if (art.legacy_slug) art.legacySlug = art.legacy_slug;
            if (seedIds.hasOwnProperty(art.id)) {
                merged[seedIds[art.id]] = art; // override seed
            } else {
                merged.push(art);
            }
        }
        // Sort by date descending
        merged.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
        return merged;
    }

    async function getById(id) {
        var all = await getAll();
        for (var i = 0; i < all.length; i++) {
            if (all[i].id === id) return all[i];
        }
        return null;
    }

    async function addArticle(article) {
        if (!article.id) {
            article.id = 'article-' + Date.now();
        }
        if (!supabaseClient) return article;
        // Clean up legacySlug field name for DB
        var dbArticle = Object.assign({}, article);
        if (dbArticle.legacySlug) {
            dbArticle.legacy_slug = dbArticle.legacySlug;
            delete dbArticle.legacySlug;
        }
        var { error } = await supabaseClient.from('articles').insert([dbArticle]);
        if (error) console.error('Error adding article:', error);
        return article;
    }

    async function updateArticle(id, updatedArticle) {
        if (!supabaseClient) return;
        updatedArticle.id = id;
        var dbArticle = Object.assign({}, updatedArticle);
        if (dbArticle.legacySlug) {
            dbArticle.legacy_slug = dbArticle.legacySlug;
            delete dbArticle.legacySlug;
        }
        var { error } = await supabaseClient.from('articles').update(dbArticle).eq('id', id);
        if (error) console.error('Error updating article:', error);
    }

    async function deleteArticle(id) {
        if (!supabaseClient) return;
        var { error } = await supabaseClient.from('articles').delete().eq('id', id);
        if (error) console.error('Error deleting article:', error);
    }

    function formatDate(dateStr, lang) {
        if (!dateStr) return '';
        var d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        if (lang === 'jp') {
            return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
        }
        var months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    // ── Category helpers ─────────────────────────────────────────────
    var CATEGORIES = {
        'default': { en: 'Default', jp: 'デフォルト' },
        'indo-japan': { en: 'Indo Japan Corridor', jp: 'インド・日本コリドー' },
        'indo-us': { en: 'Indo US Corridor', jp: 'インド・米国コリドー' },
        'indo-europe': { en: 'Indo Europe Corridor', jp: 'インド・欧州コリドー' }
    };

    function getCategoryName(slug, lang) {
        lang = lang || 'en';
        if (CATEGORIES[slug]) return CATEGORIES[slug][lang] || CATEGORIES[slug].en;
        return slug;
    }

    // ── Language helpers ─────────────────────────────────────────────
    var LANG_KEY = 'da_lang';

    function getLang() {
        return localStorage.getItem(LANG_KEY) || 'en';
    }

    function setLang(lang) {
        localStorage.setItem(LANG_KEY, lang);
    }

    // UI labels for multi-language
    var UI_LABELS = {
        en: {
            home: 'Home',
            articles: 'Publications',
            searchPlaceholder: 'Search publications by title or keyword...',
            noResults: 'No publications found matching your criteria.',
            readMore: 'Read More',
            backToArticles: '← Back to Publications',
            disclaimer: 'Views are personal. For any feedback or query, feel free to connect with us at',
            filterAll: 'All Categories',
            filterNewest: 'Newest First',
            filterOldest: 'Oldest First'
        },
        jp: {
            home: 'ホーム',
            articles: '出版物',
            searchPlaceholder: 'タイトルまたはキーワードで出版物を検索...',
            noResults: '条件に一致する出版物が見つかりません。',
            readMore: '続きを読む',
            backToArticles: '← 出版物一覧に戻る',
            disclaimer: 'ご意見は個人的なものです。フィードバックやお問い合わせは、以下までお気軽にご連絡ください：',
            filterAll: 'すべてのカテゴリー',
            filterNewest: '新しい順',
            filterOldest: '古い順'
        }
    };

    function getLabel(key, lang) {
        lang = lang || getLang();
        return (UI_LABELS[lang] && UI_LABELS[lang][key]) || UI_LABELS.en[key] || key;
    }

    // ── Public API ───────────────────────────────────────────────────
    return {
        getAll: getAll,
        getById: getById,
        addArticle: addArticle,
        updateArticle: updateArticle,
        deleteArticle: deleteArticle,
        formatDate: formatDate,
        getCategoryName: getCategoryName,
        CATEGORIES: CATEGORIES,
        getLang: getLang,
        setLang: setLang,
        getLabel: getLabel,
        UI_LABELS: UI_LABELS,
        supabase: supabaseClient
    };

})();
