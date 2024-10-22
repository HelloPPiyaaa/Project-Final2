import React, { useEffect, useState } from "react";
import "../misc/helpcentre.css"; // นำเข้าไฟล์ CSS เพื่อใช้ตกแต่ง
import Navbar2 from "../Navbar/Navbar1"; // นำเข้า Navbar
import { fetchQuestionsAPI } from "../api/manageQAPI"; // นำเข้า API สำหรับดึงคำถาม
import AnimationWrapper from "./page-animation"; // นำเข้า component สำหรับใส่ animation ในหน้าเว็บ

const HelpCentre = () => {
  const [questions, setQuestions] = useState<any[]>([]); // state สำหรับเก็บคำถาม
  const [searchQuery, setSearchQuery] = useState(""); // state สำหรับเก็บข้อความที่ใช้ค้นหา

  useEffect(() => {
    // ฟังก์ชันใช้ดึงข้อมูลคำถามจาก API เมื่อหน้าเว็บโหลด
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuestionsAPI(); // เรียก API ดึงคำถาม
        if (Array.isArray(fetchedQuestions)) {
          setQuestions(fetchedQuestions); // ถ้าข้อมูลที่ได้เป็น array ให้เก็บลงใน state `questions`
        } else {
          console.error("Fetched questions is not an array"); // ถ้าไม่ใช่ array แสดง error
        }
      } catch (error) {
        console.error("Failed to load questions:", error); // แสดง error ถ้าดึงข้อมูลไม่สำเร็จ
      }
    };

    loadQuestions(); // เรียกฟังก์ชัน loadQuestions เมื่อหน้าเว็บโหลดครั้งแรก
  }, []); // useEffect ทำงานครั้งเดียวหลังจาก render ครั้งแรก

  // ฟังก์ชันจัดการการค้นหา เมื่อผู้ใช้กรอกข้อความในช่องค้นหา
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase()); // อัปเดต searchQuery และแปลงข้อความเป็นตัวพิมพ์เล็ก
  };

  // ฟิลเตอร์คำถาม โดยตรวจสอบว่า topic ของคำถามมีคำที่ผู้ใช้ค้นหาหรือไม่
  const filteredFaqs = questions.filter((faq) =>
    faq.topic.toLowerCase().includes(searchQuery)
  );

  return (
    <AnimationWrapper> {/* ใส่ Animation ให้กับหน้าเว็บ */}
      <div className="help-centre"> {/* คลาสสำหรับตกแต่ง */}
        <header className="header">
          <h1>ศูนย์ช่วยเหลือ</h1>
          <h2>How can we help you?</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..." // ช่องค้นหา
              value={searchQuery} // ค่าที่ผู้ใช้กรอกในช่องค้นหา
              onChange={handleSearchChange} // เรียกฟังก์ชันเมื่อมีการเปลี่ยนแปลงในช่องค้นหา
            />
            <button>Search</button> {/* ปุ่มค้นหา */}
          </div>
        </header>
        
        {/* แสดงคำถามที่ผ่านการกรอง */}
        <div className="faq">
          {filteredFaqs.length > 0 ? ( // ถ้ามีคำถามที่ตรงกับการค้นหา
            filteredFaqs.map((faq, index) => (
              <div className="faq-item" key={index}>
                <details>
                  <summary className="faq-question">{faq.topic}</summary> {/* แสดงหัวข้อคำถาม */}
                  <div className="faq-answer">{faq.answer}</div> {/* แสดงคำตอบ */}
                </details>
              </div>
            ))
          ) : (
            <p>No results found.</p> // ถ้าไม่มีคำถามที่ตรงกับการค้นหา
          )}
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default HelpCentre; // ส่งออก component สำหรับใช้ในที่อื่น
