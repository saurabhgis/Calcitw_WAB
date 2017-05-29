﻿define(
   ({
    page1: {
      selectToolHeader: "เลือกวิธีการ เพื่อใช้ในการเลือกบันทึกสำหรับการปรับปรุงเป็นชุด",
      selectToolDesc: "เครื่องมือวิจเก็จสนับสนุนวิธีการทั้ง 3 ในการเลือกบันทึกการปรับปรุงค่าในตารางเป็นชุด โดยคุณสามารถวิธีใดวิธีหนึ่ง ถ้าคุณจำเป็นต้องใช้มากกว่าหนึ่งวิธีให้สร้างเครื่องมือวิจเก็จใหม่",
      selectByShape: "เลือกตามพื้นที่",
      selectBySpatQuery: "เลือกตามคุณลักษณะ",
      selectByAttQuery: "เลือกตามคุณลักษณะและคุณลักษณะที่เกี่ยวข้อง",
      selectByQuery: "เลือกตามการสอบถาม",
      toolNotSelected: "กรุณาเลือกวิธีการเลือก"
    },
    page2: {
      layersToolHeader: "เลือกชั้นข้อมูลในการอัพเดตและตัวเลือกของการเลือกเครื่องมือ (ถ้ามี)",
      layersToolDesc: "วิธีการเลือกที่คุณเลือกบนหน้าหนึ่งจะถูกใช้ในการเลือกและปรับปรุงชุดของชั้นข้อมูลที่ระบุไว้ด้านล่าง หากคุณเลือกมากกว่าหนึ่งชั้นข้อมูล เฉพาะฟิลด์ที่แก้ไขได้เหมือนกันเท่านั้นที่จะสามารถแก้ไขข้อมูลได้ ทั้งนี้ขึ้นอยู่กับเครื่องมือที่ใช้เลือก และองค์ประกอบที่จำเป็นอื่นด้วย",
      layerTable: {
        colUpdate: "ปรับปรุง",
        colLabel: "ชั้นข้อมูล",
        colSelectByLayer: "เลือกตามชั้นข้อมูล",
        colSelectByField: "สืบค้นฟิลด์",
        colhighlightSymbol: "ไฮไลท์สัญลักษณ์"
      },
      toggleLayers: "สลับการแสดงผลการมองเห็นด้วยการปิดและเปิด",
      noEditableLayers: "ไม่มีชั้นข้อมูลที่สามารถแก้ไขได้",
      noLayersSelected: "เลือกชั้นข้อมูลอย่างน้อย 1 ชั้นข้อมูลเพื่อดำเนินการ"
    },
    page3: {
      commonFieldsHeader: "เลือกฟิลด์ของชุดข้อมูลที่จะทำการอัพเดต",
      commonFieldsDesc: "เฉพาะฟิลด์ที่แก้ไขได้เหมือนกันเท่านั้นที่แสดงด้านล่าง กรุณาเลือกฟิลด์ที่คุณต้องการปรับปรุงข้อมูล ถ้ามีฟิลด์ชื่อเดียวกันจากหลายชั้นข้อมูลที่มีโดเมนต่างกัน จะแสดง และใช้ได้เพียงโดเมนเดียวเท่านั้น",
      noCommonFields: "ไม่มีฟิลด์ที่ใช้ร่วมกัน",
      fieldTable: {
        colEdit: "ที่สามารถแก้ไขได้",
        colName: "ชื่อ",
        colAlias: "ชื่อย่อ",
        colAction: "การดำเนินการ"
      }
    },
    tabs: {
      selection: "กำหนดประเภทการเลือก",
      layers: "กำหนดเลเยอร์ที่ต้องการอัพเดต",
      fields: "กำหนดฟิลด์ที่ต้องการอัพเดต"
    },
    errorOnOk: "กรุณากรอกพารามิเตอร์ทั้งหมดก่อนที่จะบันทึกการตั้งค่า",
    next: "ถัดไป",
    back: "กลับ",
    save: "บันทึกสัญลักษณ์",
    cancel: "ยกเลิก",
    ok: "ตกลง",
    symbolPopup: "เลือกสัญลักษณ์"
  })
);
