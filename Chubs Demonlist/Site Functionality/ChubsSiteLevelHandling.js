// ChubsSiteLevelHandling.js (FINAL VERSION: Local Absolute Ranks for ALL Sorts)

let ALL_LEVELS_DATA = []; 
const UNRANKED_PLACEMENT = 9999; 
const AREDL_LIVE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUF5jEMgif8By06uX0cedKk_71SoGf3RyTR4dGkNsSPNg0P8BEwANv0gyVvNHZRytb9o3KDsWj-JaF/pub?output=csv'; 


// --- Helper Functions (UNCHANGED) ---

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

// --- UPDATED Level Detail Loading (Using Local ALL_LEVELS_DATA) ---
// This function assumes the level name (Name or DisplayName) is passed to it.

// --- UPDATED Level Detail Loading (Using Local ALL_LEVELS_DATA) ---
// Now includes the 'aredldata' panel.

// --- UPDATED loadLevelData (Includes Video Embed) ---

function loadLevelData(levelName) {
    
    // 1. Get references to your display elements
    const nameDisplay = document.getElementById('statstext'); 
    
    // Panel content elements (The ones that currently have 'P')
    const extremeNumDiv = document.getElementById('extremenumdata');
    const completionDateDiv = document.getElementById('completiondatedata');
    const worstDeathDiv = document.getElementById('worstdeathdata');
    const trueDiv = document.getElementById('truedata');
    const attemptsDiv = document.getElementById('attemptsdata');
    const lengthDiv = document.getElementById('lengthdata');
    const enjoymentDiv = document.getElementById('enjoymentdata');
    const hrDiv = document.getElementById('heartratedata');
    const aredlDiv = document.getElementById('aredldata');
    
    // 🌟 NEW: Reference for the Video Box Div
    const videoboxDiv = document.getElementById('videobox');
    
    
    // 2. Find the level object in the global array (ALL_LEVELS_DATA)
    const selectedLevel = ALL_LEVELS_DATA.find(level => 
        (level.DisplayName || level.Name) === levelName
    );
    
    if (!selectedLevel) {
        videoboxDiv.innerHTML = ''; // Clear video box on error
        return; 
    }



    // 4. Populate all eight data divs (EXISTING LOGIC)
    extremeNumDiv.textContent = selectedLevel.ExtremeCount || 'N/A';
    completionDateDiv.textContent = selectedLevel.CompletionDate || 'N/A';
    worstDeathDiv.textContent = selectedLevel.WorstDeath || 'N/A';
    trueDiv.textContent = selectedLevel['True%'] || 'N/A';
    attemptsDiv.textContent = selectedLevel.Attempts || 'N/A';
    lengthDiv.textContent = selectedLevel.Length || 'N/A';
    enjoymentDiv.textContent = selectedLevel.Enjoyment ? `${selectedLevel.Enjoyment}/100` : 'N/A';
    hrDiv.textContent = selectedLevel.MaxBPM || 'N/A';
    
    const aredlRank = selectedLevel.OfficialAREDLRank;
    // Assuming UNRANKED_PLACEMENT is defined (e.g., 9999)
    if (aredlRank === UNRANKED_PLACEMENT) {
        aredlDiv.textContent = 'Unranked';
    } else if (aredlRank) {
        aredlDiv.textContent = `#${aredlRank}`;
    } else {
        aredlDiv.textContent = 'N/A';
    }
    
    
    // 5. 🌟 NEW: Populate the Video Box with the YouTube Embed
    const extremeCount = selectedLevel.ExtremeCount;
    const YOUTUBE_PLAYLIST_ID = "PL-NVoF9O1eL32_sDluVvJ_CBFqhj8D3fU"

    if (extremeCount && YOUTUBE_PLAYLIST_ID) {
        const videoIndex = extremeCount; 
        
        // 🛑 CRITICAL FIX: Add &playlist=YOUTUBE_PLAYLIST_ID to force single-video looping.
        const embedUrl = `https://www.youtube.com/embed/?list=${YOUTUBE_PLAYLIST_ID}&index=${videoIndex}&loop=1`;

        // Inject the iframe into the videobox div
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
        // Fallback message if data or ID is missing
        videoboxDiv.innerHTML = `
            <div style="text-align: center; color: white; padding-top: 50%;">
                <p>Video not available.</p>
                <p>Ensure ExtremeCount is set and YOUTUBE_PLAYLIST_ID is defined.</p>
            </div>
        `;
    }
    
    console.log(`Displaying data and video for ${levelName}.`);
}
// --- CRITICAL RANKING FUNCTION (UPDATED) ---

function assignAllLocalRanks(levels) {
    
    // 1. Assign Date Rank (Already in ExtremeCount)
    // No change needed, it uses the source data (ExtremeCount).

    // 2. Assign Local AREDL Rank (Uses OfficialAREDLRank for sorting, 
    //    then uses ExtremeCount to break ties for unranked levels)
    let aredlSorted = [...levels].sort((a, b) => {
        // Sort primary by AREDL Rank (1, 2, 3... 9999)
        let primarySort = (a.OfficialAREDLRank || UNRANKED_PLACEMENT) - (b.OfficialAREDLRank || UNRANKED_PLACEMENT);
        if (primarySort !== 0) return primarySort;
        
        // Break ties using ExtremeCount (your completion order)
        return a.ExtremeCount - b.ExtremeCount;
    });

    // 3. Assign Absolute Enjoyment Rank (Highest score is Rank 1)
    let enjoymentSorted = [...levels].sort((a, b) => b.Enjoyment - a.Enjoyment);

    // 4. Assign Absolute Length Rank (Longest Length is Rank 1)
    let lengthSorted = [...levels].sort((a, b) => b.sortLength - a.sortLength);

    
    // --- MAP Ranks (1 to 175) to the Levels ---
    
    const localRanks = new Map();

    // Map the local AREDL rank (1 to 175/176)
    let currentAREDLRank = 1;
    for (const level of aredlSorted) {
        // Store the rank. Use the UNRANKED_PLACEMENT flag only if the level is officially unranked AND
        // we are not assigning a rank to it yet (this handles levels that don't need a rank in the final render)
        level.LocalAREDLRank = (level.OfficialAREDLRank === UNRANKED_PLACEMENT && currentAREDLRank > levels.length) ? UNRANKED_PLACEMENT : currentAREDLRank++;
    }
    
    // Helper function to assign ranks with tie-handling
    const assignAndMap = (arr, key, tieBreaker) => {
        let rank = 1;
        arr.forEach((level, i) => {
            if (i > 0) {
                // If the value is less than the previous level's value (or meets tiebreaker for equal values)
                if (tieBreaker(level, arr[i-1])) {
                     rank = i + 1;
                }
            }
            level[key] = rank;
        });
    };

    assignAndMap(enjoymentSorted, 'AbsoluteEnjoymentRank', (current, previous) => current.Enjoyment < previous.Enjoyment);
    assignAndMap(lengthSorted, 'AbsoluteLengthRank', (current, previous) => current.sortLength < previous.sortLength);


    // Consolidate all ranks into a single map keyed by Name for final merger
    const rankMap = new Map();
    [...aredlSorted, ...enjoymentSorted, ...lengthSorted].forEach(level => {
        const existing = rankMap.get(level.Name) || {};
        rankMap.set(level.Name, {
            ...existing,
            LocalAREDLRank: level.LocalAREDLRank,
            AbsoluteEnjoymentRank: level.AbsoluteEnjoymentRank,
            AbsoluteLengthRank: level.AbsoluteLengthRank
        });
    });

    // Final merge back to original data structure
    return levels.map(level => {
        const ranks = rankMap.get(level.Name);
        return {
            ...level,
            LocalAREDLRank: ranks.LocalAREDLRank,
            AbsoluteEnjoymentRank: ranks.AbsoluteEnjoymentRank,
            AbsoluteLengthRank: ranks.AbsoluteLengthRank,
        };
    });
}


// --- List Rendering (Displays correct absolute rank based on sortBy) ---

function renderLevels(levelsToRender, sortBy) {




    const levelsContainer = document.getElementById('levelscontainer');
    levelsContainer.innerHTML = ''; 

    levelsToRender.forEach((level, index) => {
        
        if (!level) return;
        
        const entryWrapper = document.createElement('div');
        entryWrapper.className = 'level-entry-wrapper';
        
        const rankDiv = document.createElement('div');
        rankDiv.className = 'level-rank-box';
        
        // --- FINAL ABSOLUTE RANK LOGIC ---
        let rankValue;
        
        switch (sortBy) {
            case 'date':
                rankValue = level.ExtremeCount;
                break;
            case 'aredl':
                // CRITICAL: Use the calculated Local Absolute Rank (1, 2, 3...)
                rankValue = level.LocalAREDLRank;
                break;
            case 'enjoyment':
            case 'opinion':
                rankValue = level.AbsoluteEnjoymentRank;
                break;
            case 'length':
                rankValue = level.AbsoluteLengthRank;
                break;
            default:
                // Fallback: show the position in the list
                rankValue = index + 1;
        }
        
        // Final display logic: Show '-' for unranked levels, otherwise show the number
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
        // ... inside renderLevels, after creating the levelDiv (or its wrapper)
    
        levelDiv.addEventListener('click', () => {
        const levelName = level.DisplayName || level.Name; // Get the level name (e.g., "Cataclysm")
        
        // 1. Load the data into the statistics panel
        loadLevelData(levelName); 

        // 2. Visual Feedback (Highly Recommended for 'Tabbed' experience)
        // You need to remove the 'selected' class from all other levels first:
        document.querySelectorAll('.level-entry-wrapper').forEach(wrapper => {
            wrapper.classList.remove('selected');
        });
        // Then, add the 'selected' class to the clicked element's wrapper
        entryWrapper.classList.add('selected'); 
    });
    
    // ...
    });
}

// --- Search Handler (UNCHANGED) ---

function handleSearch() {
    sortLevels(); 
}

// --- Sorting Logic (Uses Pre-calculated Ranks) ---

function sortLevels() {
    const sortselect = document.getElementById('sortselect');
    const sortBy = sortselect.value;
    
    // 1. Filter the data based on the search term
    const searchInput = document.getElementById('searchinput');
    const searchTerm = (searchInput ? searchInput.value.toLowerCase() : '').trim();
    
    let filteredLevels = ALL_LEVELS_DATA;

    if (searchTerm) {
        filteredLevels = ALL_LEVELS_DATA.filter(level => {
            const displayName = (level.DisplayName || level.Name).toLowerCase();
            return displayName.includes(searchTerm);
        });
    }

    // 2. Sort the filtered data
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
                // Sort by OfficialAREDLRank (live rank)
                valA = a.OfficialAREDLRank || UNRANKED_PLACEMENT;
                valB = b.OfficialAREDLRank || UNRANKED_PLACEMENT;
                currentSortOrder = -1; 
                break;

            case 'opinion':
            case 'enjoyment':
                valA = a.Enjoyment || 0;
                valB = b.Enjoyment || 0;
                currentSortOrder = 1; 
                break;
                
            case 'length':
                valA = a.sortLength;
                valB = b.sortLength;
                currentSortOrder = 1; 
                break;
                
            default:
                return a.ExtremeCount - b.ExtremeCount; 
        }

        if (valA < valB) return currentSortOrder * 1;
        if (valA > valB) return currentSortOrder * -1;
        
        return a.ExtremeCount - b.ExtremeCount; 
    });

    // 3. Render the filtered and sorted data, passing the sort type
    renderLevels(sortedLevels, sortBy);
}


// --- Initial Data Fetching and Merging ---
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

        // 2. Parse the CSV data
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
        
        // 3. Merge Personal Data with Official Rank
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

        // 4. Calculate ALL absolute ranks (Date, AREDL, Enjoyment, Length)
        ALL_LEVELS_DATA = assignAllLocalRanks(tempLevels);
        
        // 5. Initial render (Default sort is 'date')
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