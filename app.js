let penguinStatsData;
let penguinStatsStageData;
let penguinStatsZoneData;
let zones;
let eventStages;
let eventItems;
let eventStageIds;
let eventStagesInfo;

const penguinStatsItemIds = ['30013', '30103', '30023', '30083', '30043', '31013', '30033', '31033', '30073', '30053', '30093', '30063', '31023', '31043', '31053', '31063'];
const materials_penguin = {
    '30073': 'Loxic Kohl',
    '30063': 'Integrated Devices',
    '30013': 'Orirock Cluster',
    '31023': 'Incandescent Alloy',
    '30043': 'Oriron Cluster',
    '30053': 'Aketon',
    '30083': 'Manganese Ore',
    '30093': 'Grindstone',
    '31013': 'Coagulating Gel',
    '30103': 'RMA70-12',
    '30033': 'Polyester Pack',
    '30023': 'Sugar Pack',
    '31033': 'Crystalline Component',
    '31053' : 'Compound Cutting Fluid',
    '31043' : 'Semi-Synthetic Solvent',
    '31064' : 'Salt'
}

function init() {
    console.log('test');
    
    const Http = new XMLHttpRequest();
    const url='https://penguin-stats.io/PenguinStats/api/v2/result/matrix?is_personal=false&server=CN&show_closed_zones=true';
    Http.open("GET", url, true);
    Http.send();

    Http.onload = (e) => {
        penguinStatsData = JSON.parse(Http.responseText).matrix;

        const Http2 = new XMLHttpRequest();
        const url2='https://penguin-stats.io/PenguinStats/api/v2/stages?server=CN';
        Http2.open("GET", url2, true);
        Http2.send();

        Http2.onload = (e) => {
            penguinStatsStageData = JSON.parse(Http2.responseText);

            const Http3 = new XMLHttpRequest();
            const url3='https://penguin-stats.io/PenguinStats/api/v2/zones';
            Http3.open("GET", url3, true);
            Http3.send();

            Http3.onload = (e) => {
                penguinStatsZoneData = JSON.parse(Http3.responseText);
                zones = penguinStatsZoneData.filter(data => (!data.existence.US.exist || data.existence.US.closeTime > Date.now()) && data.type === 'ACTIVITY' && !data.zoneId.includes('mini') && !data.zoneId.includes('act12sre'));
                eventStages = penguinStatsData.filter(data => zones[0].stages.includes(data.stageId) && penguinStatsItemIds.includes(data.itemId)).sort((a, b) => a.stageId > b.stageId ? 1 : -1);
                for(let i = 0; i < zones.length; i++) {
                    let option = document.createElement('option');
                    option.text = zones[i].zoneName_i18n.en;
                    option.value = zones[i].zoneId;
                    document.getElementById("events").add(option);
                }
                document.getElementById("eventImg").src = 'https://penguin-stats.s3.amazonaws.com' + zones[0].background;
                eventStageIds = [];
                for(let i = 0; i < eventStages.length; i++) {
                    eventStageIds.push(eventStages[i].stageId);
                }

                eventStagesInfo = penguinStatsStageData.filter(data => eventStageIds.includes(data.stageId));
                eventItems = penguinStatsData.filter(data => zones[0].stages.includes(data.stageId) && materials_penguin[data.itemId]);
                for(let i = 0; i < eventStagesInfo.length; i++) {
                    let option = document.createElement('option');
                    option.text = eventStagesInfo[i].code + ': ' + materials_penguin[eventItems[i].itemId] + ' ' + ((100 * (parseFloat(eventStages[i].quantity/eventStages[i].times))).toFixed(2) + '%') + ' (' + eventStagesInfo[i].apCost + ' Sanity)';
                    option.value = eventStagesInfo[i].stageId;
                    document.getElementById("stage").add(option);
                }
                let dropsString = '';
                
                if(eventStagesInfo.length === 0) {
                    
                    if(zones[0].zoneId.includes('act12')){
                        //dropsString = '<:rock_cluster:871554618243551263> <:manganese:871554618499416146> <:orion:871554618696556554>';
                    }
                } else if(!eventStagesInfo[0].zoneId.includes('mini')) {
                    for(let i = 0; i < eventStages.length; i++) {
                        //dropsString += eventStagesInfo[i].code + ': ' + constants.materials_penguin[eventItems[i].itemId] + ' ' + ((100 * (parseFloat(eventStages[i].quantity/eventStages[i].times))).toFixed(2) + '%') + ' (' + eventStagesInfo[i].apCost + ' Sanity)\n';
                    }
                } else {
                    dropsString = 'N/A';
                }
            }
        }
    }
}

function changeEvent() {

    let L = document.getElementById('stage').options.length - 1;
    for(let i = L; i >= 0; i--) {
        document.getElementById('stage').remove(i);
    }

    let eventIndex = document.getElementById('events').selectedIndex;
    eventStages = penguinStatsData.filter(data => zones[eventIndex].stages.includes(data.stageId) && penguinStatsItemIds.includes(data.itemId)).sort((a, b) => a.stageId > b.stageId ? 1 : -1);

    document.getElementById("eventImg").src = 'https://penguin-stats.s3.amazonaws.com' + zones[eventIndex].background;
    eventStageIds = [];
    for(let i = 0; i < eventStages.length; i++) {
        eventStageIds.push(eventStages[i].stageId);
    }

    eventStagesInfo = penguinStatsStageData.filter(data => eventStageIds.includes(data.stageId));
    eventItems = penguinStatsData.filter(data => zones[eventIndex].stages.includes(data.stageId) && materials_penguin[data.itemId]);
    for(let i = 0; i < eventStagesInfo.length; i++) {
        let option = document.createElement('option');
        option.text = eventStagesInfo[i].code + ': ' + materials_penguin[eventItems[i].itemId] + ' ' + ((100 * (parseFloat(eventStages[i].quantity/eventStages[i].times))).toFixed(2) + '%') + ' (' + eventStagesInfo[i].apCost + ' Sanity)';
        option.value = eventStagesInfo[i].stageId;
        document.getElementById("stage").add(option);
    }
}

function calculateSanityCost() {
    let sanity = document.getElementById('maxSanity').value;
    if(!sanity || sanity === 0)
        return;

    let materials = document.getElementById('matCount').value;
    if(!materials || materials === 0)
        return;

    let currentEvent = document.getElementById('events').value;
    let currentStage = document.getElementById('stage').value;
    let currentItemData = eventItems[document.getElementById('stage').selectedIndex];

    let sanityPerItem = (currentItemData.quantity/currentItemData.times);
    let totalSanityCost = (eventStagesInfo[document.getElementById('stage').selectedIndex].apCost * (1 / sanityPerItem)) * materials;

    document.getElementById('costLabel').innerHTML = 'You will need approximately: ';
    document.getElementById('sanity').innerHTML = Math.ceil(totalSanityCost) + ' Sanity or';
    document.getElementById('smallPot').innerHTML = Math.ceil(totalSanityCost / 80) + ' Small Potions or';
    document.getElementById('largePot').innerHTML = Math.ceil(totalSanityCost / 120) + '  Large Potions or';
    document.getElementById('prime').innerHTML = Math.ceil(totalSanityCost / sanity) + ' Prime';
}