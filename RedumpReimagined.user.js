// ==UserScript==
// @name        Redump Reimagined
// @namespace   nightson1988@gmail.com
// @match       http://redump.org/newdisc/*
// @grant       none
// @version     0.1
// @author      nightson
// @description Make submission easier than ever before!
// ==/UserScript==
(function (){
  let fragment = document.createDocumentFragment(),
      insertNode = document.querySelector('#newdisc fieldset'),
      fieldset = document.createElement('fieldset'),
      legend = document.createElement('legend'),
      textarea = document.createElement('textarea'),
      br = document.createElement('br'),
      br2 = document.createElement('br'),
      input = document.createElement('input'),
      fileInput = document.createElement('input');
  
  legend.innerHTML = 'Submission Info';
  
  textarea.id = 'd_subinfo';
  textarea.class = 'input';
  textarea.style = 'width: 600px; height: 300px';
  
  input.id = 'd_parse'
  input.value = "Parse";
  input.type = "button";
  
  fileInput.id = 'd_subjson';
  fileInput.type = 'file';
  fileInput.setAttribute('accept', '.json;.txt');
 
  
  fieldset.appendChild(legend);
  fieldset.appendChild(fileInput);
  fieldset.appendChild(br2);
  fieldset.appendChild(textarea);
  fieldset.appendChild(br);
  fieldset.appendChild(input);
  
  fragment.appendChild(fieldset);
  
  insertNode.parentNode.insertBefore(fragment, insertNode);
  
  document.getElementById('d_subjson').addEventListener('change', onChange);
  document.getElementById('d_parse').addEventListener('click', parse);
  
  async function parse(event) {
    let file = await fileToJSON(document.getElementById('d_subjson').files[0]),
        commonInfo = file.common_disc_info;
    
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
    checkBySelector('#d_category option[value="' + commonInfo.d_category + '"]');
    //Region
    checkBySelector('#tr_d_region input[value="' + commonInfo.d_region + '"]');
    //Language
    commonInfo.d_languages.forEach(function (item) {
      checkBySelector('input[name="d_languages[]"][value="' + item + '"]');
    });
    //Disc Serial
    fillForm('#d_serial', commonInfo.d_serial);
    //Ring Codes
    fillForm('#d_ring_wip', generateRingCodesText(file));
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
    fillForm('#d_version', file.versions_and_editions.d_version);
    //Edition
    if (document.querySelector('input[value="' + file.versions_and_editions.d_editions_text + '"]')) {
      checkBySelector('input[name="d_editions[]"][value="' + file.versions_and_editions.d_editions_text + '"]');
    } else {
       fillForm('#d_editions_text', file.versions_and_editions.d_editions_text);
    }

    /*EDC section (PSX only)*/
    checkBySelector('input[name="d_edc"][value="' + file.edc.d_edc + '"]');

    /* Extras*/
    //PVD
    fillForm('#d_pvd', file.extras.d_pvd);
    //Disc Key
    fillForm('#d_d1_key', file.extras.d_d1_key);
    //Disc ID
    fillForm('#d_d2_key', file.extras.d_d2_key);
    //PIC
    fillForm('#d_pic_data', file.extras.d_pic_data);
    //Header
    fillForm('#d_header', file.extras.d_header);
    //BCA
    fillForm('#d_bca', file.extras.d_bca);
    //Security Sector Ranges
    fillForm('#d_ssranges', file.extras.d_ssranges);
    

    /* Copy protection */
    //Anti-modchip protection
    checkBySelector('input[name="d_protection_a"][value="' + file.copy_protection.d_protection_a + '"]');
    //d_libcrypt
    fillForm('#d_libcrypt', file.copy_protection.d_libcrypt);
    //Protection
    if ((file.copy_protection.d_protection).trim() != 'None found') {
      fillForm('#d_protection', file.copy_protection.d_protection);
    }
    //SecuROM data
    fillForm('#d_securom', file.copy_protection.d_securom);

   
    /* Tracks and write offsets */
    //DAT
    fillForm('#d_tracks', file.tracks_and_write_offsets.d_tracks);
    //Cue
    fillForm('#d_cue', file.tracks_and_write_offsets.d_cue);
    //Disc Offset
    if (document.querySelector('input[value="' + file.tracks_and_write_offsets.d_offset_text + '"]')) {
      checkBySelector('input[name="d_offset[]"][value="' + file.versions_and_editions.d_editions_text + '"]');
    } else {
       fillForm('#d_offset_text', file.tracks_and_write_offsets.d_offset_text);
    }
  }

  /* Size & checksums (DVD/BD/UMD-based) */
  fillForm('#d_size', file.size_and_checksums.d_size);
  fillForm('#d_crc32', file.size_and_checksums.d_size);
  fillForm('#d_md5', file.size_and_checksums.d_size);
  fillForm('#d_sha1', file.size_and_checksums.d_size);


  async function onChange(event) {
    let file = await fileToJSON(event.target.files[0]);
    function filter(key, value){
      if (key == 'artifacts') {
        return undefined;
      }
      return value;
    }
    document.getElementById('d_subinfo').value = JSON.stringify(file, filter, 2);
  }
  
  async function fileToJSON(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = event => resolve(JSON.parse(event.target.result))
      fileReader.onerror = error => reject(error)
      fileReader.readAsText(file)
    })
  }
  
  function fillForm(cssSelector, value) {
    if (!document.querySelector(cssSelector)) {
      console.log('Error: ' + cssSelector + 'doesn\'t match any element on the page!');
    } else if (typeof value === 'undefined' || value.trim() == '') {
      console.log('Error: Value doesn\'t exist!');
    } else {
      document.querySelector(cssSelector).value = value;
    }
  }
  
  function checkBySelector(cssSelector) {
    if (!document.querySelector(cssSelector)){
      console.log('Error: ' + cssSelector + 'doesn\'t match any element on the page!');
    } else {
      document.querySelector(cssSelector).checked = true;
    }
  }
  
  function checkList (key, arr, inputid) {
    if (key in arr) {
      document.querySelector(arr[key]).checked = true;
    } else {
      document.querySelector(inputid).value = offset;
    }
  }
  
  function generateRingCodesText(file) {
    let ringInfo = file.common_disc_info,
        ringCodes = '',
        reverseOrder = (['ps2','ps3', 'ps4', 'ps5'].indexOf(file.common_disc_info.d_system) > -1);

    switch (ringInfo.d_media) {
      case 'cdrom':
      case 'gdrom':
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
      case 'dvd':
      case 'hddvd':
      case 'bdrom':
      case 'gc':
      case 'wii':
      case 'wiiu':
        if (file.size_and_checksums.d_layerbreak_3 != '0') {
          ringCodes = reverseOrder ? "Layer 0 (Outer):\n" : "Layer 0 (Inner):\n" +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' +
                      'Data Side Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' +
                      'Data Side Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' +
                      'Layer 1:\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma2 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts2 + '\n' +
                      'Label Side Mould SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Label Side Additional Mould: ' + ringInfo.dr_ring_0_mo2 + '\n\n' +
                      'Layer 2:\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma3 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma3_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts3 + '\n\n' +
                      reverseOrder ? 'Layer 3 (Inner):\n' : 'Layer 3(Outer):\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma4 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma4_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts4;
          return ringCodes;
          break;
        } else if (file.size_and_checksums.d_layerbreak_2 != '0') {
          ringCodes = reverseOrder ? "Layer 0 (Outer):\n" : "Layer 0 (Inner):\n" +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' +
                      'Data Side Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' +
                      'Data Side Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' +
                      'Layer 1:\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma2 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts2 + '\n' +
                      'Label Side Mould SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Label Side Additional Mould: ' + ringInfo.dr_ring_0_mo2 + '\n\n' +
                      reverseOrder ? 'Layer 2 (Inner):\n' : 'Layer 2 (Outer):\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma3 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma3_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts3;
          return ringCodes;
          break;
        } else if (file.size_and_checksums.d_layerbreak != '0') {
          ringCodes = reverseOrder ? 'Layer 0 (Outer):\n' : 'Layer 0 (Inner):\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' +
                      'Data Side Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' +
                      'Data Side Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' +
                      reverseOrder ? 'Layer 1 (Inner):\n' : 'Layer 1 (Outer):\n' +
                      'Mastering Ring: ' + ringInfo.d_ring_0_ma2 + '\n' +
                      'Mastering SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts2 + '\n' +
                      'Label Side Mould SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
                      'Label Side Additional Mould: ' + ringInfo.dr_ring_0_mo2;
          return ringCodes;
          break;
        } else {
          if (ringInfo.d_ring_0_ma2 || d_ring_0_ma2_sid || ringInfo.d_ring_0_ts2 || ringInfo.d_ring_0_mo2_sid || ringInfo.dr_ring_0_mo2) {
            ringCodes = 'Data Side:\n' +
                        'Mastering Ring: ' + ringInfo.d_ring_0_ma1 + '\n' + 
                        'Mastering SID: ' + ringInfo.d_ring_0_ma1_sid + '\n' + 
                        'Toolstamp/Mastering Code: ' + ringInfo.d_ring_0_ts1 + '\n' + 
                        'Mould SID: ' + ringInfo.d_ring_0_mo1_sid + '\n' + 
                        'Additional Mould: ' + ringInfo.dr_ring_0_mo1 + '\n\n' + 
                        'Label Side: \n' +
                        'Mastering Ring: ' + ringInfo.d_ring_0_ma2 + '\n' +
                        'Mastering SID: ' + ringInfo.d_ring_0_mo2_sid + '\n' +
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
