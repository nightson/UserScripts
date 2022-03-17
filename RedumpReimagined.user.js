// ==UserScript==
// @name        Redump Reimagined
// @namespace   nightson1988@gmail.com
// @match       http://redump.org/newdisc/*
// @grant       none
// @version     0.3
// @author      nightson
// @description Make submission easier than ever before!
// @updateURL   https://github.com/nightson/UserScripts/raw/main/RedumpReimagined.user.js
// @downloadURL https://github.com/nightson/UserScripts/raw/main/RedumpReimagined.user.js
// @history     0.3 Updated to be compatible with MPF v2.3
// ==/UserScript==
(function (){
  //Insert submission information input
  let parser = new DOMParser(),
      htmlString = '<fieldset id="fieldset_subinfo"><legend>Submission Info</legend><input id="d_subjson" type="file" accept=".json;.txt"><br><textarea id="d_subinfo" style="width: 600px; height: 300px;"></textarea><br><input id="d_parse" type="button" value="Parse"></fieldset>',
      insertNode = document.querySelector('#newdisc fieldset'),
      node = parser.parseFromString(htmlString, "text/html").getElementById('fieldset_subinfo');

  insertNode.parentNode.insertBefore(node, insertNode);
  
  document.getElementById('d_subjson').addEventListener('change', readJSON);
  document.getElementById('d_parse').addEventListener('click', parse);
  
  function parse(event) {
    let str = document.getElementById('d_subinfo').value;
    
    if (str.trim() === '') {
      alert ('Submission info is empty!')
    } else if (isJSON(str) && typeof JSON.parse(str).common_disc_info != 'undefined') {//Check if string is MPF JSON output
      let subInfo = JSON.parse(str),
          commonInfo = subInfo.common_disc_info;
      
      /* Common disc info section*/
      //Main Title
      fillForm('#d_title', commonInfo.d_title);
      //Foreign Title
      fillForm('#d_title_foreign', commonInfo.d_title_foreign);
      //Disc Number
      fillForm('#d_number', commonInfo.d_number);
      //Disc Label
      fillForm('#d_label', commonInfo.d_label);
      //Disc Category
      selectBySelector('#d_category option[value="' + commonInfo.d_category + '"]');
      //Region
      checkBySelector('#tr_d_region input[value="' + commonInfo.d_region + '"]');
      //Language
      commonInfo.d_languages.forEach(function (item) {
        checkBySelector('input[name="d_languages[]"][value="' + item + '"]');
      });
      //Disc Serial
      fillForm('#d_serial', commonInfo.d_serial);
      //Ring Codes
      fillForm('#d_ring_wip', generateRingCodesText(subInfo));
      //Barcode
      fillForm('#d_barcode', commonInfo.d_barcode);
      //Exe Date
      fillForm('#d_date', commonInfo.d_date);
      //Disc Errors
      fillForm('#d_errors', commonInfo.d_errors);
      //Comments
      fillForm('#d_comments', commonInfo.d_comments);
      //Contents
      fillForm('#d_contents', commonInfo.d_contents);
      
      /*Version and editions*/
      //Version
      fillForm('#d_version', subInfo.versions_and_editions.d_version);
      //Edition
      if (document.querySelector('input[value="' + subInfo.versions_and_editions.d_editions_text + '"]')) {
        checkBySelector('input[name="d_editions[]"][value="' + subInfo.versions_and_editions.d_editions_text + '"]');
      } else {
         fillForm('#d_editions_text', subInfo.versions_and_editions.d_editions_text);
      }

      /*EDC section (PSX only)*/
      checkBySelector('input[name="d_edc"][value="' + subInfo.edc.d_edc + '"]');

      /* Extras*/
      //PVD
      fillForm('#d_pvd', subInfo.extras.d_pvd);
      //Disc Key
      fillForm('#d_d1_key', subInfo.extras.d_d1_key);
      //Disc ID
      fillForm('#d_d2_key', subInfo.extras.d_d2_key);
      //PIC
      fillForm('#d_pic_data', subInfo.extras.d_pic_data);
      //Header
      fillForm('#d_header', subInfo.extras.d_header);
      //BCA
      fillForm('#d_bca', subInfo.extras.d_bca);
      //Security Sector Ranges
      fillForm('#d_ssranges', subInfo.extras.d_ssranges);
      

      /* Copy protection */
      //Anti-modchip protection
      checkBySelector('input[name="d_protection_a"][value="' + subInfo.copy_protection.d_protection_a + '"]');
      //d_libcrypt
      fillForm('#d_libcrypt', subInfo.copy_protection.d_libcrypt);
      //Protection
      if (typeof subInfo.copy_protection.d_protection != undefined) {
        fillForm('#d_protection', subInfo.copy_protection.d_protection);
      }
      //SecuROM data
      fillForm('#d_securom', subInfo.copy_protection.d_securom);

     
      /* Tracks and write offsets */
      //DAT
      fillForm('#d_tracks', subInfo.tracks_and_write_offsets.d_tracks);
      //Cue
      fillForm('#d_cue', subInfo.tracks_and_write_offsets.d_cue);
      //Disc Offset
      if (typeof subInfo.tracks_and_write_offsets.d_offset_text != "undefined") {
        let offsetValue = (parseInt(subInfo.tracks_and_write_offsets.d_offset_text.trim()) > 0) ? ('+' + subInfo.tracks_and_write_offsets.d_offset_text) : subInfo.tracks_and_write_offsets.d_offset_text;
        if (document.querySelector('input[value="' + offsetValue + '"]')) {
          checkBySelector('input[name="d_offset[]"][value="' + offsetValue + '"]');
        } else {
          fillForm('#d_offset_text', offsetValue);
        }
      }
      
      /* Size & checksums (DVD/BD/UMD-based) */
      fillForm('#d_layerbreak', subInfo.size_and_checksums.d_layerbreak);
      fillForm('#d_size', subInfo.size_and_checksums.d_size);
      fillForm('#d_crc32', subInfo.size_and_checksums.d_crc32);
      fillForm('#d_md5', subInfo.size_and_checksums.d_md5);
      fillForm('#d_sha1', subInfo.size_and_checksums.d_sha1);
    } else if (/^-{80}/.test(str)) {//Check if string is in my own submission info format. 
    } else {
      console.log ('Redump Reimagined || Error: Unknown Information Format!');
    }
  }
  
  async function readJSON(event) {
    let file = await fileToJSON(event.target.files[0]);
    function filter(key, value){
      if (key == 'artifacts') {
        return undefined;
      } else {
        return value;
      }
    }
    document.getElementById('d_subinfo').value = JSON.stringify(file, filter, 2).replace(/\[T:ISBN\] \(OPTIONAL\)|\(REQUIRED\)|\(OPTIONAL\)|\(REQUIRED, IF EXISTS\)|\(CHECK WITH PROTECTIONID\)/g, '');//Remove Placeholders
  }

  //https://stackoverflow.com/questions/23344776/how-to-access-data-of-uploaded-json-file
  async function fileToJSON(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = event => resolve(JSON.parse(event.target.result))
      fileReader.onerror = error => reject(error)
      fileReader.readAsText(file)
    })
  }

//https://stackoverflow.com/questions/9804777/how-to-test-if-a-string-is-json-or-not
  function isJSON(str) {
    str = typeof str !== "string" ? JSON.stringify(str) : str;

    try {
      str = JSON.parse(str);
    } catch (e) {
      return false;
    }

    if (typeof str === "object" && str !== null) {
      return true;
    } else {
      return false;
    }
  }
  
  function regex(re, str) {
    if (typeof re.match(str) === null) {
      console.log('Redump Reimagined || Error: Regular expression "' + re + '" doesn\'t match anything');
      return false;
    } else if (re.match(str)[0].trim() == 'None') {
      console.log('Redump Reimagined || Error: Regular expression "' + re + '" matches empty value');
    } else {
      return re.match(str);
    }
  }
  
  function fillForm(cssSelector, value) {
    if (!document.querySelector(cssSelector)) {
      console.log('Redump Reimagined || Error: CSS selector "' + cssSelector + '" doesn\'t match any element on the page!');
    } else if (typeof value === 'undefined' || value.toString().trim() === '') {
      console.log('Redump Reimagined || Error: Value doesn\'t exist!');
    } else {
      switch (value.toString().trim()){
        case 'Disc has no PVD': 
          console.log('Redump Reimagined || Disc has no PVD');
          break;
        case 'None found': 
          console.log('Redump Reimagined || Protection not found');
          break;
        case 'Path could not be scanned!': 
          console.log('Redump Reimagined || Path could not be scanned!');
          break;
        default: 
          document.querySelector(cssSelector).value = value;
      }
    }
  }
  
  function checkBySelector(cssSelector) {
    if (!document.querySelector(cssSelector)){
      console.log('Redump Reimagined || Error: CSS selector "' + cssSelector + '" doesn\'t match any element on the page!');
    } else {
      document.querySelector(cssSelector).checked = true;
    }
  }

  function selectBySelector(cssSelector) {
    if (!document.querySelector(cssSelector)){
      console.log('Redump Reimagined || Error: CSS selector "' + cssSelector + '" doesn\'t match any element on the page!');
    } else {
      document.querySelector(cssSelector).selected = true;
    }
  }

//https://github.com/SabreTools/MPF/blob/2.3/MPF/ViewModels/DiscInformationViewModel.cs
//https://github.com/SabreTools/MPF/blob/2.3/RedumpLib/Data/Enumerations.cs

  function generateRingCodesText(file) {
    let ringInfo = file.common_disc_info,
        ringCodes = '',
        reverseOrder = (['ps2','ps3', 'ps4', 'ps5'].indexOf(file.common_disc_info.d_system) > -1);

    switch (ringInfo.d_media) {
      case 'CD':
      case 'GD-ROM':
        if (ringInfo.d_ring_0_mo2_sid || ringInfo.dr_ring_0_mo2) {
          ringCodes = 'Data Side:\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' + 
                      'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' + 
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' + 
                      'Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' + 
                      'Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' + 
                      'Label Side: \n' + 
                      'Mould SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' + 
                      'Additional Mould: ' + ringInfo.dr_ring_0_mo2;
          return ringCodes;
          break;
        } else {
          ringCodes = 'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' + 
                      'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' + 
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' + 
                      'Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' + 
                      'Additional Mould: ' + ringInfo.dr_ring_0_mo1;
          return ringCodes;
          break;
        }
      case 'DVD-5':
      case 'DVD-9':
      case 'HD-DVD SL':
      case 'BD-25':
      case 'BD-50':
      case 'Nintendo GameCube Game Disc':
      case 'Nintendo Wii Optical Disc DL':
      case 'Nintendo Wii Optical Disc SL':
      case 'Nintendo Wii U Optical Disc SL':
        if (file.size_and_checksums.d_layerbreak_3 != '0') {
          ringCodes = (reverseOrder ? "Layer 0 (Outer):\n" : "Layer 0 (Inner):\n") +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' +
                      'Data Side Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' +
                      'Data Side Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' +
                      'Layer 1:\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma2 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma2_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts2 + '\n' +
                      'Label Side Mould SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Label Side Additional Mould: ' + ringInfo.dr_ring_0_mo2 + '\n\n' +
                      'Layer 2:\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma3 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma3_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts3 + '\n\n' +
                      (reverseOrder ? 'Layer 3 (Inner):\n' : 'Layer 3(Outer):\n') +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma4 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma4_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts4;
          return ringCodes;
          break;
        } else if (file.size_and_checksums.d_layerbreak_2 != '0') {
          ringCodes = (reverseOrder ? "Layer 0 (Outer):\n" : "Layer 0 (Inner):\n") +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' +
                      'Data Side Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' +
                      'Data Side Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' +
                      'Layer 1:\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma2 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma2_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts2 + '\n' +
                      'Label Side Mould SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Label Side Additional Mould: ' + ringInfo.dr_ring_0_mo2 + '\n\n' +
                      (reverseOrder ? 'Layer 2 (Inner):\n' : 'Layer 2 (Outer):\n') +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma3 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma3_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts3;
          return ringCodes;
          break;
        } else if (file.size_and_checksums.d_layerbreak != '0') {
          ringCodes = (reverseOrder ? 'Layer 0 (Outer):\n' : 'Layer 0 (Inner):\n') +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' +
                      'Data Side Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' +
                      'Data Side Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' +
                      (reverseOrder ? 'Layer 1 (Inner):\n' : 'Layer 1 (Outer):\n') +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma2 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma2_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts2 + '\n' +
                      'Label Side Mould SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Label Side Additional Mould: ' + ringInfo.dr_ring_0_mo2;
          return ringCodes;
          break;
        } else {
          if (ringInfo.d_ring_0_ma2 || ringInfo.d_ring_0_ma2_sid || ringInfo.d_ring_0_ts2 || ringInfo.d_ring_0_mo2_sid || ringInfo.dr_ring_0_mo2) {
            ringCodes = 'Data Side:\n' +
                        'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' + 
                        'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' + 
                        'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' + 
                        'Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' + 
                        'Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' + 
                        'Label Side: \n' +
                        'Mastering Ring: ' + ringInfo.d_ring_0_ma2 + '\n' +
                        'Mastering SID: ' + ringInfo.d_ring_0_ma2_sid + '\n' +
                        'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts2 + '\n' +
                        'Mould SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                        'Additional Mould: ' + ringInfo.dr_ring_0_mo2;
            return ringCodes;
            break;
          } else {
            ringCodes = 'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' + 
                        'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' + 
                        'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' + 
                        'Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' + 
                        'Additional Mould: ' + ringInfo.dr_ring_0_mo1;
            return ringCodes;
            break;
          }
        }
        default:
        return '';
    }
  }
})();
