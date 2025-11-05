let ALL_LEVELS_DATA = []; 
const UNRANKED_PLACEMENT = 9999; 
const AREDL_LIVE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUF5jEMgif8By06uX0cedKk_71SoGf3RyTR4dGkNsSPNg0P8BEwANv0gyVvNHZRytb9o3KDsWj-JaF/pub?output=csv'; 
function parseLengthToSeconds(lengthString) {
    if (!lengthString) return 0;
    const parts = lengthString.split(':');
    if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
    }
    return 0;
}
function parseCompletionDate(dateString) { 
    if (!dateString) return new Date(0);
    const strippedDate = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1'); 
    return new Date(strippedDate).getTime();
}
function loadLevelData(levelName) {
    const nameDisplay = document.getElementById('statstext'); 
    const extremeNumDiv = document.getElementById('extremenumdata');
    const completionDateDiv = document.getElementById('completiondatedata');
    const worstDeathDiv = document.getElementById('worstdeathdata');
    const trueDiv = document.getElementById('truedata');
    const attemptsDiv = document.getElementById('attemptsdata');
    const lengthDiv = document.getElementById('lengthdata');
    const enjoymentDiv = document.getElementById('enjoymentdata');
    const hrDiv = document.getElementById('heartratedata');
    const aredlDiv = document.getElementById('aredldata');
    const videoboxDiv = document.getElementById('videobox');
    const summaryBoxDiv = document.getElementById('summarybox');
    const selectedLevel = ALL_LEVELS_DATA.find(level => 
        (level.DisplayName || level.Name) === levelName
    );
    if (!selectedLevel) {
        videoboxDiv.innerHTML = '';
        summaryBoxDiv.textContent = 'Please select a level.';
        return; 
    }
    extremeNumDiv.textContent = selectedLevel.ExtremeCount || 'N/A';
    completionDateDiv.textContent = selectedLevel.CompletionDate || 'N/A';
    worstDeathDiv.textContent = selectedLevel.WorstDeath || 'N/A';
    trueDiv.textContent = selectedLevel['True%'] || 'N/A';
    attemptsDiv.textContent = selectedLevel.Attempts || 'N/A';
    lengthDiv.textContent = selectedLevel.Length || 'N/A';
    enjoymentDiv.textContent = selectedLevel.Enjoyment ? `${selectedLevel.Enjoyment}/100` : 'N/A';
    hrDiv.textContent = selectedLevel.MaxBPM || 'N/A';
    const aredlRank = selectedLevel.OfficialAREDLRank;
    if (aredlRank === UNRANKED_PLACEMENT) {
        aredlDiv.textContent = 'Unranked';
    } else if (aredlRank) {
        aredlDiv.textContent = `#${aredlRank}`;
    } else {
        aredlDiv.textContent = 'N/A';
    }
    const extremeCount = selectedLevel.ExtremeCount;
    const YOUTUBE_PLAYLIST_ID = "PL-NVoF9O1eL32_sDluVvJ_CBFqhj8D3fU"
    if (extremeCount && YOUTUBE_PLAYLIST_ID) {
        const videoIndex = extremeCount; 
        const embedUrl = `https://www.youtube.com/embed/?list=${YOUTUBE_PLAYLIST_ID}&index=${videoIndex}&loop=1`;
        videoboxDiv.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        videoboxDiv.innerHTML = `
            <div style="text-align: center; color: white; padding-top: 50%;">
                <p>Video not available.</p>
                <p>Ensure ExtremeCount is set and YOUTUBE_PLAYLIST_ID is defined.</p>
            </div>
        `;
    }
    if (selectedLevel.Summary) {
        summaryBoxDiv.textContent = selectedLevel.Summary;
    } else {
        summaryBoxDiv.textContent = 'No summary available for this level.';
    }
    console.log(`Displaying data and video for ${levelName}.`);
}
function assignAllLocalRanks(levels) {
    let aredlSorted = [...levels].sort((a, b) => {
        let primarySort = (a.OfficialAREDLRank || UNRANKED_PLACEMENT) - (b.OfficialAREDLRank || UNRANKED_PLACEMENT);
        if (primarySort !== 0) return primarySort;
        return a.ExtremeCount - b.ExtremeCount;
    });
    let enjoymentSorted = [...levels].sort((a, b) => (b.Enjoyment || 0) - (a.Enjoyment || 0));
    let lengthSorted = [...levels].sort((a, b) => (b.sortLength || 0) - (a.sortLength || 0));
    let attemptsSorted = [...levels].sort((a, b) => (b.Attempts || 0) - (a.Attempts || 0));
    const localRanks = new Map();
    let currentAREDLRank = 1;
    for (const level of aredlSorted) {
        level.LocalAREDLRank = (level.OfficialAREDLRank === UNRANKED_PLACEMENT && currentAREDLRank > levels.length) ? UNRANKED_PLACEMENT : currentAREDLRank++;
    }
    const assignAndMap = (arr, key, tieBreaker) => {
        let rank = 1;
        arr.forEach((level, i) => {
            if (i > 0) {
                if (tieBreaker(level, arr[i-1])) {
                     rank = i + 1;
                }
            }
            level[key] = rank;
        });
    };
    assignAndMap(enjoymentSorted, 'AbsoluteEnjoymentRank', (current, previous) => (current.Enjoyment || 0) < (previous.Enjoyment || 0));
    assignAndMap(lengthSorted, 'AbsoluteLengthRank', (current, previous) => (current.sortLength || 0) < (previous.sortLength || 0));
    assignAndMap(attemptsSorted, 'AbsoluteAttemptsRank', (current, previous) => (current.Attempts || 0) < (previous.Attempts || 0));
    const rankMap = new Map();
    [...aredlSorted, ...enjoymentSorted, ...lengthSorted, ...attemptsSorted].forEach(level => {
        const existing = rankMap.get(level.Name) || {};
        rankMap.set(level.Name, {
            ...existing,
            LocalAREDLRank: level.LocalAREDLRank,
            AbsoluteEnjoymentRank: level.AbsoluteEnjoymentRank,
            AbsoluteLengthRank: level.AbsoluteLengthRank,
            AbsoluteAttemptsRank: level.AbsoluteAttemptsRank
        });
    });
    return levels.map(level => {
        const ranks = rankMap.get(level.Name);
        return {
            ...level,
            LocalAREDLRank: ranks.LocalAREDLRank,
            AbsoluteEnjoymentRank: ranks.AbsoluteEnjoymentRank,
            AbsoluteLengthRank: ranks.AbsoluteLengthRank,
            AbsoluteAttemptsRank: ranks.AbsoluteAttemptsRank,
        };
    });
}
function renderLevels(levelsToRender, sortBy) {
    const levelsContainer = document.getElementById('levelscontainer');
    levelsContainer.innerHTML = ''; 
    levelsToRender.forEach((level, index) => {
        if (!level) return;
        const entryWrapper = document.createElement('div');
        entryWrapper.className = 'level-entry-wrapper';
        const rankDiv = document.createElement('div');
        rankDiv.className = 'level-rank-box';
        let rankValue;
        switch (sortBy) {
            case 'date':
                rankValue = level.ExtremeCount;
                break;
            case 'aredl':
                rankValue = level.LocalAREDLRank;
                break;
            case 'enjoyment':
            case 'opinion':
                rankValue = level.AbsoluteEnjoymentRank;
                break;
            case 'length':
                rankValue = level.AbsoluteLengthRank;
                break;
            case 'attempts':
                rankValue = level.AbsoluteAttemptsRank;
                break;
            default:
                rankValue = index + 1;
        }
        let rankText;
        if (rankValue === UNRANKED_PLACEMENT) {
            rankText = '-'; 
        } else {
            rankText = rankValue; 
        }
        rankDiv.textContent = rankText; 
        entryWrapper.appendChild(rankDiv);
        const levelDiv = document.createElement('div');
        levelDiv.className = 'level-name-box';
        levelDiv.textContent = level.DisplayName || level.Name; 
        entryWrapper.appendChild(levelDiv);
        function setupHover(element) {
            element.addEventListener('mouseenter', () => entryWrapper.classList.add('highlight'));
            element.addEventListener('mouseleave', () => entryWrapper.classList.remove('highlight'));
        }
        setupHover(rankDiv);
        setupHover(levelDiv);
        levelsContainer.appendChild(entryWrapper);
        levelDiv.addEventListener('click', () => loadLevelData(level.DisplayName || level.Name));
        levelDiv.addEventListener('click', () => {
        const levelName = level.DisplayName || level.Name;
        loadLevelData(levelName);
        document.querySelectorAll('.level-entry-wrapper').forEach(wrapper => {
            wrapper.classList.remove('selected');
        });
        entryWrapper.classList.add('selected'); 
    });
    });
}
function handleSearch() {
    sortLevels(); 
}
function sortLevels() {
    const sortselect = document.getElementById('sortselect');
    const sortBy = sortselect.value;
    const searchInput = document.getElementById('searchinput');
    const searchTerm = (searchInput ? searchInput.value.toLowerCase() : '').trim();
    let filteredLevels = ALL_LEVELS_DATA;
    if (searchTerm) {
        filteredLevels = ALL_LEVELS_DATA.filter(level => {
            const displayName = (level.DisplayName || level.Name).toLowerCase();
            return displayName.includes(searchTerm);
        });
    }
    let sortedLevels = [...filteredLevels];
    let defaultSortOrder = 1; 
    sortedLevels.sort((a, b) => {
        let valA, valB;
        let currentSortOrder = defaultSortOrder;
        switch (sortBy) {
            case 'date':
                valA = a.ExtremeCount || UNRANKED_PLACEMENT;
                valB = b.ExtremeCount || UNRANKED_PLACEMENT;
                currentSortOrder = -1; 
                break;
            case 'aredl':
                valA = a.OfficialAREDLRank || UNRANKED_PLACEMENT;
                valB = b.OfficialAREDLRank || UNRANKED_PLACEMENT;
                currentSortOrder = -1; 
                break;
            case 'enjoyment':
                valA = a.Enjoyment || 0;
                valB = b.Enjoyment || 0;
                currentSortOrder = 1; 
                break;
            case 'length':
                valA = a.sortLength || 0;
                valB = b.sortLength || 0;
                currentSortOrder = 1; 
                break;
            case 'attempts':
                valA = a.Attempts || 0;
                valB = b.Attempts || 0;
                currentSortOrder = 1;
                break;
            default:
                return a.ExtremeCount - b.ExtremeCount; 
        }
        if (valA < valB) return currentSortOrder * 1;
        if (valA > valB) return currentSortOrder * -1;
        
        return a.ExtremeCount - b.ExtremeCount; 
    });
    renderLevels(sortedLevels, sortBy);
}
async function initializeData() {
    try {
        const [personalResponse, aredlResponse] = await Promise.all([
            fetch('Completed Extremes.json'), 
            fetch(AREDL_LIVE_URL) 
        ]);
        if (!personalResponse.ok) {
            throw new Error(`Failed to load local JSON: ${personalResponse.statusText}. Check file name: 'Completed Extremes.json'`);
        }
        const personalLevels = await personalResponse.json();
        const aredlCsv = await aredlResponse.text();
        const rows = aredlCsv.trim().split('\n');
        const aredlMap = new Map();
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(','); 
            if (cols.length >= 2) {
                const rank = parseInt(cols[0].trim());
                const name = cols[1].trim().replace(/"/g, ''); 
                if (name && !isNaN(rank)) {
                    aredlMap.set(name.toLowerCase(), rank);
                }
            }
        }
        let tempLevels = personalLevels
            .map((level, index) => {
                if (!level.Name || typeof level.Name !== 'string') {
                    console.warn(`Skipping malformed entry: Level #${level.ExtremeCount} is missing a valid 'Name' field.`);
                    return null; 
                }
                const officialRank = aredlMap.get(level.Name.toLowerCase());
                return {
                    ...level,
                    sortLength: parseLengthToSeconds(level.Length),
                    sortDate: parseCompletionDate(level.CompletionDate),
                    OfficialAREDLRank: officialRank !== undefined ? officialRank : UNRANKED_PLACEMENT, 
                    ExtremeCount: level.ExtremeCount || index + 1,
                };
            })
            .filter(level => level !== null);
        ALL_LEVELS_DATA = assignAllLocalRanks(tempLevels);
        const defaultSort = 'date';
        renderLevels(ALL_LEVELS_DATA, defaultSort);
        
        const sortselect = document.getElementById('sortselect');
        const searchInput = document.getElementById('searchinput');
        
        if (sortselect) {
             sortselect.addEventListener('change', sortLevels);
             sortselect.value = defaultSort;
        }
        if (searchInput) {
            searchInput.addEventListener('keyup', handleSearch);
        }

    } catch (error) {
        console.error('CRITICAL INITIALIZATION ERROR:', error.message, error);
    }
}

initializeData();