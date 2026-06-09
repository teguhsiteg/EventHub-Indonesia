/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, MapPin, Receipt, Award, User, Settings, Ticket, 
  Clock, Download, ExternalLink, Sparkles, AlertCircle, CheckCircle, 
  Smartphone, Barcode, ShieldCheck, Trash2, Save, ShieldAlert, Mail 
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export const ParticipantDashboard: React.FC = () => {
  const { 
    registrations, currentUser, updatePaymentStatus, updateCurrentUser, deleteUserAccount,
    emails, deleteEmail, markEmailAsRead, clearAllEmails 
  } = useApp();
  const [activeMenu, setActiveMenu] = useState<'events' | 'tickets' | 'invoices' | 'certificates' | 'profile' | 'settings' | 'emails'>('events');
  const [timeTick, setTimeTick] = useState(Date.now());
  const [payingRegId, setPayingRegId] = useState<string | null>(null);
  const [isProcessingLocalPay, setIsProcessingLocalPay] = useState(false);

  // Profile editing local states
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editWhatsapp, setEditWhatsapp] = useState(currentUser.whatsapp || '081234567890');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150');
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Layered Confirm status for account pruning
  const [deleteStep, setDeleteStep] = useState(0); // 0: Idle, 1: Stage 1 confirm, 2: Stage 2 text confirm
  const [confirmPhraseInput, setConfirmPhraseInput] = useState('');
  const [isDeletingUserPruning, setIsDeletingUserPruning] = useState(false);

  // Filter registrations belonging to the current user (using email match since Budi Santoso is Budi)
  const myRegs = registrations.filter(r => r.personalInfo.email.toLowerCase() === currentUser.email.toLowerCase());

  // Simulated Email Sandbox States
  const myEmails = (emails || []).filter(e => e.to.toLowerCase() === currentUser.email.toLowerCase());
  const unreadEmailsCount = myEmails.filter(e => !e.read).length;
  const [selectedEmailId, setSelectedEmailId] = useState<string>('');
  const activeEmail = myEmails.find(e => e.id === selectedEmailId) || myEmails[0];

  // Auto-set selected email when active email switches to emails list or when first loaded
  useEffect(() => {
    if (myEmails.length > 0 && !selectedEmailId) {
      setSelectedEmailId(myEmails[0].id);
    }
  }, [emails, currentUser.email]);

  // Ticket focus state
  const [selectedRegId, setSelectedRegId] = useState<string>(myRegs[0]?.id || '');
  const activeRegForTicket = myRegs.find(r => r.id === selectedRegId) || myRegs[0];

  // Set up timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize local edit fields when currentUser state loads or switches
  useEffect(() => {
    setEditName(currentUser.name);
    setEditEmail(currentUser.email);
    setEditWhatsapp(currentUser.whatsapp || '081234567895');
    setEditAvatar(currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150');
  }, [currentUser]);

  // Monitor and auto-transition pending payments to expired if timer reaches limit (10 minutes)
  useEffect(() => {
    registrations.forEach(reg => {
      if (reg.paymentInfo.status === 'pending') {
        const createdAtTime = new Date(reg.createdAt).getTime();
        const duration = 10 * 60 * 1000; // 10 minutes limit
        if (Date.now() - createdAtTime > duration) {
          updatePaymentStatus(reg.id, 'expired');
        }
      }
    });
  }, [timeTick, registrations, updatePaymentStatus]);

  // Helper to calculate remaining timer MM:SS
  const getRemainingTime = (createdAtStr: string) => {
    const createdAtTime = new Date(createdAtStr).getTime();
    const duration = 10 * 60 * 1000; // 10 minutes
    const diff = (createdAtTime + duration) - timeTick;
    if (diff <= 0) return '00:00';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Helper to simulate paying directly from dashboard card
  const handleSimulatePayingInDashboard = (regId: string) => {
    setPayingRegId(regId);
    setIsProcessingLocalPay(true);
    setTimeout(() => {
      setIsProcessingLocalPay(false);
      setPayingRegId(null);
      updatePaymentStatus(regId, 'paid');
    }, 1800);
  };

  // Profile save handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: editName,
      email: editEmail,
      whatsapp: editWhatsapp,
      avatar: editAvatar
    });
    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
    }, 3000);
  };

  // Executing account deletion with database cleanup
  const handleExecuteDeletion = () => {
    if (confirmPhraseInput !== 'HAPUS AKUN SAYA PERMANEN') return;
    setIsDeletingUserPruning(true);
    
    // Simulate server side data purging and cleanup delays
    setTimeout(() => {
      deleteUserAccount();
      setIsDeletingUserPruning(false);
      setDeleteStep(0);
      setConfirmPhraseInput('');
      setActiveMenu('events'); // Re-route to events tab
    }, 1800);
  };

  const handleDownloadPDF = (reg: typeof registrations[0]) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // Outer border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.rect(5, 5, 138, 200);

    // Deep Slate Header
    doc.setFillColor(15, 23, 42);
    doc.rect(5, 5, 138, 40, 'F');

    // Brand Name
    doc.setTextColor(6, 182, 212);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('EventHub', 12, 19);

    doc.setTextColor(255, 255, 255);
    doc.text('Indonesia', 51, 19);

    // Subtitle
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('OFFICIAL ACCESS PASS & ATHLETE ENTRY PASS', 12, 25);

    // BIB Badge
    doc.setFillColor(6, 182, 212);
    doc.roundedRect(102, 12, 32, 11, 2, 2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`BIB: ${reg.bibNumber}`, 106, 19.5);

    // Event Info Section
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('ATHLETIC TOURNAMENT', 12, 57);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    const titleLines = doc.splitTextToSize(reg.eventTitle, 124);
    doc.text(titleLines, 12, 64);

    const titleHeight = titleLines.length * 6;
    let nextY = 64 + titleHeight + 3;

    // Two-Column Athlete Details Card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(10, nextY, 128, 54, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(10, nextY, 128, 54, 4, 4, 'D');

    // Field 1: ATHLETE NAME
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('ATHLETE NAME', 16, nextY + 11);
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${reg.personalInfo.firstName} ${reg.personalInfo.lastName}`, 16, nextY + 17);

    // Field 2: RUNNING CATEGORY CLASS
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CATEGORY / CLASS', 16, nextY + 28);
    doc.setFontSize(10.5);
    doc.setTextColor(6, 143, 170);
    doc.text(reg.categoryName, 16, nextY + 34);

    // Field 3: PASS NUMBER
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TICKET NUMBER', 16, nextY + 45);
    doc.setFont('Courier', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(reg.ticketNumber, 16, nextY + 50);

    // Field 4: EVENT VENUE
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('EVENT VENUE', 78, nextY + 11);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${reg.eventCity} City grounds`, 78, nextY + 17);

    // Field 5: DATE SCHEDULE
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('DATE / SCHEDULE', 78, nextY + 28);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const dateFormatted = new Date(reg.eventDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    doc.text(dateFormatted, 78, nextY + 34);

    // Field 6: ADMISSION STATUS
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('ADMISSION STATUS', 78, nextY + 45);
    doc.setFontSize(9.5);
    doc.setTextColor(16, 185, 129);
    doc.text('PAID & REGISTERED', 78, nextY + 50);

    // Ticket Tear Divider Line
    let qrY = nextY + 62;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(10, qrY - 4, 138, qrY - 4);

    // Vector QR code mimicry
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(10, qrY, 34, 34, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(10, qrY, 34, 34, 4, 4, 'D');

    // Grid details mimicking QR barcode
    doc.setFillColor(15, 23, 42);
    // Top-left finder
    doc.rect(13, qrY + 3, 8, 8, 'F');
    doc.setFillColor(241, 245, 249);
    doc.rect(15, qrY + 5, 4, 4, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(16, qrY + 6, 2, 2, 'F');

    // Top-right finder
    doc.rect(33, qrY + 3, 8, 8, 'F');
    doc.setFillColor(241, 245, 249);
    doc.rect(35, qrY + 5, 4, 4, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(36, qrY + 6, 2, 2, 'F');

    // Bottom-left finder
    doc.rect(13, qrY + 23, 8, 8, 'F');
    doc.setFillColor(241, 245, 249);
    doc.rect(15, qrY + 25, 4, 4, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(16, qrY + 26, 2, 2, 'F');

    // Random square dots inside QR
    doc.rect(24, qrY + 3, 2, 2, 'F');
    doc.rect(28, qrY + 8, 3, 2, 'F');
    doc.rect(24, qrY + 13, 4, 2, 'F');
    doc.rect(32, qrY + 17, 2, 3, 'F');
    doc.rect(22, qrY + 20, 2, 2, 'F');
    doc.rect(25, qrY + 25, 5, 2, 'F');
    doc.rect(34, qrY + 27, 4, 2, 'F');

    // QR label
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('INSTRUCTIONS FOR ADMISSION ENTRY:', 48, qrY + 5);

    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('• Save card barcode on smartphone or print for manual validation.', 48, qrY + 11);
    doc.text('• Bring your matching KTP / Passport ID reference to the desk.', 48, qrY + 17);
    doc.text('• Arrive at the sports arena corridor checkpoint at least 1 hour early.', 48, qrY + 23);
    doc.text('• Present this QR pass cleanly to marshal check gates.', 48, qrY + 29);

    // Brand secured Footer
    doc.setFillColor(15, 23, 42);
    doc.rect(5, 192, 138, 13, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('OFFICIAL DIGITAL ATHLETIC PASS • POWERED BY EVENTHUB CO', 10, 200);
    doc.setTextColor(6, 182, 212);
    doc.text('MIDTRANS SECURED', 106, 200);

    doc.save(`EventHub-Ticket-${reg.ticketNumber}.pdf`);
  };

  const handleDownloadInvoicePDF = (reg: typeof registrations[0]) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // Outer border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.rect(5, 5, 138, 200);

    // Deep Slate Header
    doc.setFillColor(15, 23, 42);
    doc.rect(5, 5, 138, 40, 'F');

    // Brand Name
    doc.setTextColor(6, 182, 212);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('EventHub', 12, 19);

    doc.setTextColor(255, 255, 255);
    doc.text('Indonesia', 51, 19);

    // Subtitle
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('OFFICIAL TRANSACTION RECEIPT & TAX INVOICE', 12, 25);

    // INVOICE ID Pill
    doc.setFillColor(6, 182, 212);
    doc.roundedRect(88, 12, 46, 11, 2, 2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`INV: #${reg.id.slice(0, 8).toUpperCase()}`, 92, 19.5);

    // Metadata Block
    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PAYMENT METRICS', 12, 57);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    const invoiceLabel = `Invoice for ${reg.personalInfo.firstName} ${reg.personalInfo.lastName}`;
    doc.text(invoiceLabel, 12, 64);

    let nextY = 70;

    // Table Content block with borders
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(10, nextY, 128, 72, 4, 4, 'F');
    doc.roundedRect(10, nextY, 128, 72, 4, 4, 'D');

    // Sub headers
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Billing Statement Details', 16, nextY + 10);
    
    // Light line divider
    doc.setDrawColor(241, 245, 249);
    doc.line(16, nextY + 14, 132, nextY + 14);

    // Table Rows
    // Event Heading
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Item / Entry Description', 16, nextY + 22);
    doc.text('Qty', 82, nextY + 22);
    doc.text('Total Amount', 104, nextY + 22);

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    // Split long title to fit the description cell
    const descText = `${reg.eventTitle} - Class ${reg.categoryName}`;
    const descLines = doc.splitTextToSize(descText, 62);
    doc.text(descLines, 16, nextY + 29);
    doc.text('1', 83, nextY + 29);
    doc.text(`Rp ${reg.paymentInfo.finalAmount.toLocaleString('id-ID')}`, 104, nextY + 29);

    // Calculation rows at bottom of table
    doc.setDrawColor(226, 232, 240);
    doc.line(16, nextY + 45, 132, nextY + 45);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Subtotal:', 78, nextY + 52);
    const amountVal = `Rp ${reg.paymentInfo.finalAmount.toLocaleString('id-ID')}`;
    doc.setTextColor(15, 23, 42);
    doc.text(amountVal, 104, nextY + 52);

    doc.setTextColor(100, 116, 139);
    doc.text('Transaction Fee:', 78, nextY + 58);
    doc.setTextColor(15, 23, 42);
    doc.text('Rp 0 (Midtrans Secured)', 104, nextY + 58);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Grand Total Paid:', 78, nextY + 66);
    doc.setTextColor(6, 143, 170);
    doc.text(amountVal, 104, nextY + 66);

    // Stamp & Payment detail block
    let stampY = nextY + 82;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(10, stampY, 128, 30, 4, 4, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(10, stampY, 128, 30, 4, 4, 'D');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TRANSACTION VERIFICATION DATA:', 15, stampY + 7);

    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`• Payment Gateway: Midtrans E-Payment Gateway (${reg.paymentInfo.method.toUpperCase()})`, 15, stampY + 13);
    doc.text(`• Settlement Time: ${new Date(reg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 15, stampY + 18);
    doc.text(`• Reference ID: TXN-${reg.id.toUpperCase()}`, 15, stampY + 23);

    // Verified Stamp Circle at right side of payment data
    doc.setDrawColor(16, 185, 129);
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(105, stampY + 5, 28, 20, 2, 2, 'F');
    doc.roundedRect(105, stampY + 5, 28, 20, 2, 2, 'D');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129);
    doc.text('VERIFIED', 113, stampY + 12);
    doc.text('PAID SUCCESS', 108, stampY + 17);

    // Footnotes instructions
    doc.setTextColor(148, 163, 184);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('This document serves as an official confirmation of financial transaction under Go-Sport Midtrans gateway.', 12, stampY + 36);

    // Brand secured Footer
    doc.setFillColor(15, 23, 42);
    doc.rect(5, 192, 138, 13, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('OFFICIAL DIGITAL TRANSACTION RECEIPT • EVENTHUB GO CO', 10, 200);
    doc.setTextColor(6, 182, 212);
    doc.text('MIDTRANS SECURED', 106, 200);

    doc.save(`EventHub-Invoice-${reg.id.slice(0, 8).toUpperCase()}.pdf`);
  };

  const handleDownloadCertificatePDF = (reg: typeof registrations[0]) => {
    // Landscape A5
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5'
    });

    // Outer rich golden double borders
    doc.setFillColor(255, 253, 242); // ambient light cream background
    doc.rect(5, 5, 200, 138, 'F');

    // Outer golden line
    doc.setDrawColor(217, 119, 6); // Amber 600
    doc.setLineWidth(1.2);
    doc.rect(7, 7, 196, 134, 'D');

    // Inner thin golden line
    doc.setDrawColor(245, 158, 11); // Amber 500
    doc.setLineWidth(0.4);
    doc.rect(9, 9, 192, 130, 'D');

    // Creative modern corner frames
    doc.setFillColor(217, 119, 6);
    doc.rect(7, 7, 6, 6, 'F');
    doc.rect(197, 7, 6, 6, 'F');
    doc.rect(7, 135, 6, 6, 'F');
    doc.rect(197, 135, 6, 6, 'F');

    doc.setFillColor(255, 253, 242);
    doc.rect(9, 9, 3, 3, 'F');
    doc.rect(198, 9, 3, 3, 'F');
    doc.rect(9, 136, 3, 3, 'F');
    doc.rect(198, 136, 3, 3, 'F');

    // Top Head brand
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('E V E N T H U B   I N D O N E S I A', 105, 20, { align: 'center' });

    // Official Ribbon Badge
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.5);
    doc.line(55, 24, 155, 24);

    // Main Certificate title
    doc.setTextColor(217, 119, 6);
    doc.setFont('Times', 'italic');
    doc.setFontSize(26);
    doc.text('Finisher Certificate', 105, 36, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('THIS ATHLETIC FINISHER ACCOMPLISHMENT IS PROUDLY PRESENTED TO', 105, 45, { align: 'center' });

    // Athlete Name
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(`${reg.personalInfo.firstName} ${reg.personalInfo.lastName}`, 105, 59, { align: 'center' });

    // Underline
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.7);
    doc.line(65, 63, 145, 63);

    // Event Description Paragraph
    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    
    const awardDetails = `for successfully finishing the official athletic tournament course in the category`;
    doc.text(awardDetails, 105, 73, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${reg.categoryName} distance tier`, 105, 80, { align: 'center' });

    doc.setTextColor(71, 85, 105);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`organized at the elite race gathering:`, 105, 87, { align: 'center' });

    doc.setTextColor(217, 119, 6);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text(reg.eventTitle, 105, 94, { align: 'center' });

    // Specific Metadata details at bottom left/right
    doc.setTextColor(148, 163, 184);
    doc.setFont('Courier', 'bold');
    doc.setFontSize(7.5);
    doc.text(`BIB NUMBER: ${reg.bibNumber}`, 18, 112);
    doc.text(`CREDENTIAL PASS: ${reg.ticketNumber}`, 18, 117);

    // Date
    const formattedDate = new Date(reg.eventDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Settled Event Date: ${formattedDate}`, 18, 122);

    // Golden verification seal circle on the right side
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(245, 158, 11); // Amber 500
    doc.setLineWidth(0.6);
    doc.circle(174, 114, 11, 'FD');

    doc.setDrawColor(217, 119, 6); // Amber 600
    doc.circle(174, 114, 9.5, 'D');

    doc.setTextColor(180, 83, 9); // Amber 700
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('ATHLETIC', 174, 112.5, { align: 'center' });
    doc.text('VERIFIED', 174, 115.5, { align: 'center' });
    doc.text('FINISHER', 174, 118.5, { align: 'center' });

    // Download saving
    doc.save(`EventHub-Finisher-Certificate-${reg.ticketNumber}.pdf`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="mb-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="h-16 w-16 rounded-full object-cover ring-4 ring-cyan-50"
            />
            <div>
              <h1 className="font-sans text-xl font-extrabold text-slate-900">{currentUser.name}</h1>
              <p className="font-sans text-xs text-slate-400">Athletic ID: ATH-09028 | Joined June 2026</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="rounded-full bg-cyan-50 border border-cyan-100 px-3.5 py-1.5 font-bold text-cyan-700">
              {myRegs.length} Registered Events
            </span>
          </div>
        </div>

        {/* Dashboard Grid split: Sidebar Menu + Tab content */}
        <div className="grid gap-8 lg:grid-cols-4">
          
          {/* Menu Sidebar */}
          <div className="lg:col-span-1 space-y-1.5">
            {[
              { id: 'events', label: 'My Events', icon: Calendar },
              { id: 'tickets', label: 'My Tickets', icon: Ticket },
              { id: 'invoices', label: 'Invoices', icon: Receipt },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'emails', label: 'Email Box', icon: Mail },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = activeMenu === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMenu(m.id as any)}
                  className={`flex w-full items-center justify-between rounded-2xl p-3.5 text-left text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{m.label}</span>
                  </div>
                  {m.id === 'emails' && unreadEmailsCount > 0 && (
                    <span className="rounded-full bg-cyan-500 text-white font-sans text-[10px] font-extrabold px-2 py-0.5 shadow-sm animate-pulse">
                      {unreadEmailsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Core Dashboard Content panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* NO REGISTRATIONS BACKWARD GUARD */}
            {myRegs.length === 0 && ['events', 'tickets', 'invoices', 'certificates'].includes(activeMenu) ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center">
                <Ticket className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="mt-4 font-sans text-sm font-extrabold text-slate-900">No active tickets found</h3>
                <p className="mt-1 text-xs text-slate-400">You haven&apos;t registered for any tournaments yet.</p>
              </div>
            ) : (
              <>
                {/* 1. MY EVENTS */}
                {activeMenu === 'events' && (
                  <div className="space-y-4">
                    <h3 className="font-sans text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-1">REGISTERED RACE EVENTS</h3>
                    
                    {myRegs.map((reg) => {
                      const payStatus = reg.paymentInfo?.status || 'paid';
                      const isPending = payStatus === 'pending';
                      const isExpired = payStatus === 'expired';
                      const isCancelled = payStatus === 'cancelled';
                      const isPaid = payStatus === 'paid';

                      return (
                        <div key={reg.id} className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                          <div className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img 
                                src={reg.eventBanner} 
                                alt={reg.eventTitle} 
                                className="h-16 w-16 rounded-2xl object-cover"
                              />
                              <div>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                    {reg.categoryName}
                                  </span>
                                  {isPending && (
                                    <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[9px] font-extrabold text-amber-700 animate-pulse flex items-center space-x-1">
                                      <Clock className="h-3 w-3 shrink-0" />
                                      <span>MENUNGGU PEMBAYARAN: {getRemainingTime(reg.createdAt)}</span>
                                    </span>
                                  )}
                                  {isExpired && (
                                    <span className="rounded-full bg-red-550 border border-red-200 bg-red-50 px-2.5 py-0.5 text-[9px] font-extrabold text-red-700">
                                      KADALUARSA
                                    </span>
                                  )}
                                  {isCancelled && (
                                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[9px] font-bold text-slate-500">
                                      BATAL
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-sans text-base font-extrabold text-slate-900 mt-1.5">{reg.eventTitle}</h4>
                                <p className="text-xs text-slate-400 font-sans mt-0.5 flex items-center space-x-1">
                                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  <span>{reg.eventCity}</span>
                                  <span className="text-slate-200">•</span>
                                  <span>{new Date(reg.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </p>
                              </div>
                            </div>

                            {/* Event Checkin stats badge */}
                            <div className="flex items-center space-x-4">
                              <div className="text-right hidden sm:block">
                                {isPaid ? (
                                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                                    reg.checkInStatus === 'finished' 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      : reg.checkInStatus === 'checked_in'
                                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}>
                                    {reg.checkInStatus.replace('_', ' ')}
                                  </span>
                                ) : (
                                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                                    isPending ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' : 'bg-red-550 bg-red-50 text-red-755 text-red-650 border border-red-100'
                                  }`}>
                                    {isPending ? 'WAITING PAYMENT' : isExpired ? 'EXPIRED' : 'CANCELLED'}
                                  </span>
                                )}
                              </div>
                              
                              {isPaid && (
                                <button
                                  onClick={() => {
                                    setSelectedRegId(reg.id);
                                    setActiveMenu('tickets');
                                  }}
                                  className="rounded-xl border border-slate-150 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                                >
                                  Access Ticket
                                </button>
                              )}

                              {isPending && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleSimulatePayingInDashboard(reg.id)}
                                    disabled={payingRegId === reg.id}
                                    className="rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white px-3.5 py-2 text-xs font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1.5"
                                  >
                                    {payingRegId === reg.id ? (
                                      <>
                                        <div className="h-3 w-3 animate-spin rounded-full border border-slate-100 border-t-transparent" />
                                        <span>Proses...</span>
                                      </>
                                    ) : (
                                      <span>Bayar Sekarang</span>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => updatePaymentStatus(reg.id, 'cancelled')}
                                    className="rounded-xl border border-slate-205 text-slate-500 hover:bg-slate-50 px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors"
                                  >
                                    Batal
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Branded PDF & E-Certificate Actions Footer Row */}
                          <div className="border-t border-slate-50 bg-slate-50/40 px-5 py-3 flex flex-wrap gap-3 items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              RACE ID: {reg.ticketNumber}
                            </span>
                            <div className="flex items-center space-x-2">
                              {isPaid ? (
                                <>
                                  <button
                                    onClick={() => handleDownloadInvoicePDF(reg)}
                                    className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 px-3 py-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                                    title="Download visually branded invoice PDF"
                                  >
                                    <Receipt className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Invoice PDF</span>
                                  </button>

                                  {reg.checkInStatus === 'finished' ? (
                                    <button
                                      onClick={() => handleDownloadCertificatePDF(reg)}
                                      className="inline-flex items-center space-x-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                                      title="Download electronic finisher certificate PDF"
                                    >
                                      <Award className="h-3.5 w-3.5 text-amber-200 animate-pulse" />
                                      <span>E-Sertifikat PDF</span>
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="inline-flex items-center space-x-1.5 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-bold px-3 py-1.5 cursor-not-allowed opacity-60"
                                      title="Race has not concluded yet to unlock certificate"
                                    >
                                      <Clock className="h-3.5 w-3.5 shrink-0" />
                                      <span>E-Sertifikat (Locked)</span>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-[11px] font-medium text-slate-400 italic">
                                  {isPending ? 'Selesaikan pembayaran untuk mengunduh Invoice & Ticket' : 'Pesanan telah dibatalkan / kadaluarsa'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. DIGITAL TICKET */}
                {activeMenu === 'tickets' && activeRegForTicket && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h3 className="font-sans text-sm font-extrabold text-slate-400 uppercase tracking-widest">DIGITAL ADMISSION TICKETS</h3>
                    </div>
                    
                    {/* Ticket selector pills if multiple events exist */}
                    {myRegs.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto pb-1.5 custom-scrollbar">
                        {myRegs.map(reg => (
                          <button
                            key={reg.id}
                            onClick={() => setSelectedRegId(reg.id)}
                            className={`rounded-full px-3.5 py-1.5 text-[11px] font-extrabold transition-colors whitespace-nowrap ${
                              selectedRegId === reg.id
                                ? 'bg-cyan-500 text-slate-900'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {reg.eventTitle.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    )}

                    {activeRegForTicket.paymentInfo?.status !== 'paid' ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-14 px-6 text-center max-w-xl mx-auto space-y-4">
                        <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto animate-pulse">
                          <Clock className="h-6 w-6 stroke-[2]" />
                        </div>
                        <h3 className="font-sans text-base font-extrabold text-slate-900">E-Tiket Belum Aktif</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                          E-Tiket masuk digital dan nomor BIB resmi Anda akan otomatis diterbitkan setelah pembayaran Anda berhasil dikonfirmasi.
                        </p>
                        {activeRegForTicket.paymentInfo?.status === 'pending' ? (
                          <div className="pt-2">
                            <button
                              onClick={() => handleSimulatePayingInDashboard(activeRegForTicket.id)}
                              disabled={payingRegId === activeRegForTicket.id}
                              className="rounded-xl bg-cyan-705 bg-cyan-700 hover:bg-cyan-600 text-white px-5 py-2.5 text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1.5"
                            >
                              {payingRegId === activeRegForTicket.id ? (
                                <>
                                  <div className="h-3 w-3 animate-spin rounded-full border border-slate-100 border-t-transparent" />
                                  <span>Proses...</span>
                                </>
                              ) : (
                                <span>Bayar Sekarang (Simulasi)</span>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs font-extrabold text-red-500 uppercase tracking-wider">
                            STATUS TRANSAKSI: {activeRegForTicket.paymentInfo?.status === 'expired' ? 'KADALUARSA (EXPIRED)' : 'DIBATALKAN'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Highly polished AirBnb/Stripe style physical design Ticket card */}
                        <div className="rounded-3xl border border-slate-150 bg-white shadow-lg overflow-hidden max-w-xl mx-auto">
                          
                          {/* Event details block */}
                          <div className="bg-slate-900 p-6 text-white relative">
                            <div className="absolute top-6 right-6 rounded-full bg-cyan-500/20 px-3 py-1 border border-cyan-400/40 text-[9px] font-bold text-cyan-300 uppercase tracking-wider">
                              BIB {activeRegForTicket.bibNumber}
                            </div>
                            
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">OFFICIAL ACCESS PASS</p>
                            <h4 className="mt-2 text-lg font-extrabold leading-tight">{activeRegForTicket.eventTitle}</h4>
                            
                            <div className="mt-4 flex items-center space-x-1 text-xs text-slate-350">
                              <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                              <span>{activeRegForTicket.eventCity} Candi grounds</span>
                            </div>
                          </div>

                          {/* Dashed separators mimicking card tears */}
                          <div className="relative h-4 bg-white">
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-50 border border-slate-150" />
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-50 border border-slate-150" />
                            <div className="absolute left-4 right-4 top-1/2 border-t-2 border-dashed border-slate-100" />
                          </div>

                          {/* Ticket bottom verification segment */}
                          <div className="p-6 pt-2 bg-white flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                            
                            <div className="text-center md:text-left space-y-4">
                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ATHLETE NAME</p>
                                <p className="font-sans text-xs font-bold text-slate-800 mt-0.5">
                                  {activeRegForTicket.personalInfo.firstName} {activeRegForTicket.personalInfo.lastName}
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CATEGORY CLASS</p>
                                <p className="font-sans text-xs font-bold text-slate-800 mt-0.5">{activeRegForTicket.categoryName}</p>
                              </div>

                              <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TICKET NUMBER</p>
                                <p className="font-mono text-xs font-bold text-slate-900 mt-0.5">{activeRegForTicket.ticketNumber}</p>
                              </div>
                            </div>

                            {/* Interactive custom QR block */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col items-center">
                              {/* CSS vector block mimicking QR barcode details */}
                              <div className="h-28 w-[112px] bg-white p-1.5 border border-slate-200 rounded-[12px] relative flex items-center justify-center">
                                <div className="grid grid-cols-5 gap-0.5 w-[90px] h-[90px]">
                                  {Array.from({ length: 25 }).map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`w-[16px] h-[16px] ${
                                        (i*2)%3===0 || i%7===0 || i===0 || i===4 || i===20 || i===24 ? 'bg-slate-900' : 'bg-transparent'
                                      }`} 
                                      />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[8.5px] font-mono mt-2 font-bold text-slate-400">SCAN AT GATE CORRIDORS</span>
                            </div>

                          </div>

                        </div>

                        <div className="flex justify-center mt-6">
                          <button
                            id={`btn-download-pdf-bottom-${activeRegForTicket.id}`}
                            onClick={() => handleDownloadPDF(activeRegForTicket)}
                            className="inline-flex items-center space-x-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-extrabold px-6 py-3.5 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-cyan-400 shrink-0" />
                            <span>Download Visually Branded PDF Ticket</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 3. INVOICES */}
                {activeMenu === 'invoices' && (
                  <div className="space-y-4">
                    <h3 className="font-sans text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-1">BILLING STATEMENTS</h3>
                    
                    {myRegs.map(reg => (
                      <div key={reg.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div>
                            <p className="font-mono text-xs font-bold text-slate-500">Invoice ID: {reg.id}</p>
                            <p className="mt-1.5 font-sans text-xs text-slate-400 leading-normal">
                              Registered on {new Date(reg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p className="mt-1 text-slate-900 text-xs font-bold">{reg.eventTitle} ({reg.categoryName})</p>
                          </div>

                          <div className="text-right flex flex-row sm:flex-col items-baseline justify-between sm:justify-start">
                            <span className="font-mono text-sm font-extrabold text-slate-950">
                              Rp {reg.paymentInfo.finalAmount.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Method: {reg.paymentInfo.method.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-slate-50 mt-4 pt-3 flex flex-wrap gap-3 items-center justify-between text-xs">
                          {reg.paymentInfo.status === 'paid' && (
                            <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
                              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                              <span>Paid Verified via Midtrans</span>
                            </div>
                          )}

                          {reg.paymentInfo.status === 'pending' && (
                            <div className="flex items-center space-x-1.5 text-amber-600 font-semibold animate-pulse">
                              <Clock className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                              <span>Menunggu Pembayaran: {getRemainingTime(reg.createdAt)}</span>
                            </div>
                          )}

                          {reg.paymentInfo.status === 'expired' && (
                            <div className="flex items-center space-x-1.5 text-red-600 font-semibold">
                              <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                              <span>Transaksi Kadaluarsa (Expired)</span>
                            </div>
                          )}

                          {reg.paymentInfo.status === 'cancelled' && (
                            <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
                              <AlertCircle className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                              <span>Pemesanan Dibatalkan (Cancelled)</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            {reg.paymentInfo.status === 'pending' && (
                              <button
                                onClick={() => handleSimulatePayingInDashboard(reg.id)}
                                disabled={payingRegId === reg.id}
                                className="inline-flex items-center space-x-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1.5 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                              >
                                {payingRegId === reg.id ? 'Memproses...' : 'Bayar Sekarang'}
                              </button>
                            )}
                            
                            {reg.paymentInfo.status === 'paid' ? (
                              <button 
                                id={`btn-download-invoice-${reg.id}`}
                                onClick={() => handleDownloadInvoicePDF(reg)}
                                className="flex items-center space-x-1 rounded-lg border border-slate-150 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer active:scale-95 transition-all"
                              >
                                <span>Download Branded Invoice</span>
                                <Download className="h-4 w-4 text-slate-400 shrink-0" />
                              </button>
                            ) : (
                              <button 
                                disabled
                                className="flex items-center space-x-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-450 cursor-not-allowed opacity-60"
                              >
                                <span>Unduh Invoice (Locked)</span>
                                <Clock className="h-4 w-4 text-slate-300 shrink-0" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. CERTIFICATES */}
                {activeMenu === 'certificates' && (
                  <div className="space-y-4">
                    <h3 className="font-sans text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-1">FINISHER CERTIFICATE CABINET</h3>
                    
                    {myRegs.map(reg => {
                      // Check if race status finished
                      const isFinished = reg.checkInStatus === 'finished';

                      return (
                        <div key={reg.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-sans text-sm font-bold text-slate-900 leading-tight">{reg.eventTitle}</h4>
                              <p className="mt-1 text-xs text-slate-400">{reg.categoryName} Finishing Credential</p>
                            </div>
                            
                            {!isFinished ? (
                              <div className="flex items-center space-x-1 text-amber-600 font-semibold text-xs bg-amber-50 rounded-xl px-3.5 py-1.5 border border-amber-100">
                                <Clock className="h-4.5 w-4.5 shrink-0" />
                                <span>Pending Finishing</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-emerald-600 font-semibold text-xs bg-emerald-50 rounded-xl px-3.5 py-1.5 border border-emerald-100">
                                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                                <span>Ready to Mint</span>
                              </div>
                            )}
                          </div>

                          {/* Interactive Preview Certificate panel if finished */}
                          {isFinished && (
                            /* Majestic styled custom vector Certificate border */
                            <div className="mt-5 rounded-2xl border-4 border-amber-300 bg-amber-50/20 p-6 md:p-8 text-center relative overflow-hidden shadow-xs">
                              <Sparkles className="h-10 w-10 text-amber-500 absolute top-4 right-4 animate-pulse opacity-40 shrink-0" />
                              <Sparkles className="h-10 w-10 text-amber-500 absolute bottom-4 left-4 animate-pulse opacity-40 shrink-0" />
                              
                              <p className="font-sans text-[11px] font-bold text-amber-700 tracking-widest uppercase">OFFICIAL FINISHER CREDENTIAL</p>
                              
                              <h5 className="mt-4 font-serif text-2xl font-extrabold text-slate-900 tracking-tight">EventHub Indonesia</h5>
                              
                              <p className="mt-3 text-xs text-slate-400 font-sans italic">This certificate of athletic accomplishment is proudly presented to:</p>
                              
                              <p className="mt-3 font-sans text-lg font-extrabold text-slate-900 border-b border-dashed border-slate-300 pb-2 max-w-xs mx-auto">
                                {reg.personalInfo.firstName} {reg.personalInfo.lastName}
                              </p>

                              <p className="mt-3 text-xs text-slate-500 leading-normal max-w-md mx-auto">
                                for successfully completing the <strong className="text-slate-900">{reg.categoryName}</strong> distance race course with verified chip timestamp tags at the <strong className="text-slate-900">{reg.eventTitle}</strong>.
                              </p>

                              <p className="mt-6 text-[10px] font-mono text-slate-400">FINISHER BIB: {reg.bibNumber} | VERIFIED ID: {reg.ticketNumber}</p>
                              
                              <div className="mt-6 flex justify-center">
                                <button 
                                  id={`btn-download-cert-${reg.id}`}
                                  onClick={() => handleDownloadCertificatePDF(reg)}
                                  className="inline-flex items-center space-x-1 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-sans text-[11px] font-bold px-4 py-2.5 transition-colors cursor-pointer active:scale-95 transition-all"
                                >
                                  <Download className="h-3.5 w-3.5 shrink-0" />
                                  <span>Download Finisher Certificate</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 5. PROFILE */}
                {activeMenu === 'profile' && (
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs space-y-6">
                    <h3 className="font-sans text-sm font-extrabold text-slate-400 uppercase tracking-widest">PERSONAL ATHLETE PROFILE</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Athlete Name</label>
                        <input
                          type="text"
                          value={currentUser.name}
                          disabled
                          className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-100 p-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Contact WhatsApp</label>
                        <input
                          type="text"
                          value={currentUser.whatsapp || '081234567890'}
                          disabled
                          className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-100 p-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Reference</label>
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-100 p-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* 6. SETTINGS */}
                {activeMenu === 'settings' && (
                  <div className="space-y-6">
                    {/* Profil settings card */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="h-9 w-9 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-sans text-sm font-extrabold text-slate-800 uppercase tracking-wider">PENGATURAN PROFIL ATLET</h3>
                          <p className="text-[10px] text-slate-400">Sesuaikan informasi profil atlet Anda yang tersimpan di sistem.</p>
                        </div>
                      </div>

                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          <div className="flex flex-col items-center space-y-2 shrink-0 w-full md:w-32">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Foto Profil</span>
                            <img 
                              src={editAvatar} 
                              alt="Avatar Preview" 
                              className="h-20 w-20 rounded-full object-cover border border-slate-200 shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
                              }}
                            />
                            <span className="text-[9px] text-slate-400 text-center leading-normal">Gunakan link eksternal Unsplash yang aman</span>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 w-full">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Nama Lengkap</label>
                              <input
                                type="text"
                                required
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-150 p-3 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-cyan-500 transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Nomor WhatsApp</label>
                              <input
                                type="text"
                                required
                                value={editWhatsapp}
                                onChange={(e) => setEditWhatsapp(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-150 p-3 text-xs font-semibold text-slate-850 bg-white focus:outline-none focus:border-cyan-500 transition-colors"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Alamat Email</label>
                              <input
                                type="email"
                                required
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-150 p-3 text-xs font-semibold text-slate-850 bg-white focus:outline-none focus:border-cyan-500 transition-colors"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">URL Gambar Avatar (Opsional)</label>
                              <input
                                type="text"
                                value={editAvatar}
                                onChange={(e) => setEditAvatar(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-150 p-3 text-xs font-semibold text-slate-850 bg-white focus:outline-none focus:border-cyan-500 transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                          <div>
                            {showSaveMessage && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                <span>Perubahan berhasil disimpan!</span>
                              </span>
                            )}
                          </div>
                          <button
                            type="submit"
                            className="rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-sans text-xs font-extrabold px-5 py-2.5 shadow-md flex items-center space-x-1.5 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5 shrink-0" />
                            <span>Simpan Perubahan</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Communication Preference Card */}
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-650 shrink-0">
                          <Settings className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-sans text-sm font-extrabold text-slate-800 uppercase tracking-wider">PREFERENSI KOMUNIKASI</h3>
                          <p className="text-[10px] text-slate-400">Atur media komunikasi pengiriman e-Tiket dan pengingat olahraga Anda.</p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs font-semibold text-slate-700">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                          <div>
                            <p className="text-slate-900 font-bold">WhatsApp Ticket Bulletins</p>
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5">Kirim status transaksi langsung ke WhatsApp nomor telepon terdaftar.</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 cursor-pointer accent-cyan-500" />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                          <div>
                            <p className="text-slate-900 font-bold">Email Statement Receipts</p>
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5 font-sans">Kirim surat tanda bukti transaksi kuitansi pembayaran resmi ke email.</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 cursor-pointer accent-cyan-500" />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                          <div>
                            <p className="text-slate-900 font-bold">Community Event alerts</p>
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5 text-slate-400">Dapatkan alarm turnamen atletik profesional baru di kota terdekat Anda.</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-4 w-4 cursor-pointer accent-cyan-500" />
                        </div>
                      </div>
                    </div>

                    {/* Danger zone / Delete Account Card */}
                    <div className="rounded-3xl border border-red-200 bg-red-50/20 p-6 md:p-8 shadow-xs">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-9 w-9 rounded-xl bg-red-105 bg-red-100 flex items-center justify-center shrink-0">
                          <Trash2 className="h-5 w-5 text-red-650" />
                        </div>
                        <div>
                          <h3 className="font-sans text-sm font-extrabold text-red-700 uppercase tracking-wider">ZONA BAHAYA: HAPUS AKUN</h3>
                          <p className="text-[10px] text-red-500">Penghapusan akun, kuitansi, e-sertifikat, dan riwayat pendaftaran Anda secara permanen dari server.</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-red-50/65 border border-red-100 text-slate-800">
                        <div className="max-w-md">
                          <p className="text-xs font-bold text-slate-900">Hapus Akun Saya</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                            Setelah dihapus, semua data profil dan daftar event transaksional Anda akan lenyap selamanya dari pangkalan data kami serta tidak dapat dikembalikan lagi.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setDeleteStep(1); setConfirmPhraseInput(''); }}
                          className="rounded-xl border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 text-red-600 text-xs font-extrabold px-4 py-2.5 shadow-sm shrink-0 transition-colors cursor-pointer"
                        >
                          Hapus Akun Saya
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. EMAIL BOX (SANDBOX ENHANCED CLIENT) */}
                {activeMenu === 'emails' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-sans text-sm font-extrabold text-slate-800 uppercase tracking-wider">KOTAK MASUK EMAIL SIMULASI</h3>
                        <p className="text-[10px] text-slate-500">Log notifikasi email otomatis dari sistem EventHub Indonesia ke alamat email atlet Anda.</p>
                      </div>
                      {myEmails.length > 0 && (
                        <button
                          onClick={clearAllEmails}
                          className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-105 px-3.5 py-2 text-rose-600 text-[11px] font-bold transition-all cursor-pointer self-start"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus Semua Email</span>
                        </button>
                      )}
                    </div>

                    {myEmails.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center px-4 space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-300">
                          <Mail className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">Kotak Masuk Anda Kosong</h3>
                          <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-normal">
                            Notifikasi email resmi seperti <strong>Verifikasi Akun, Konfirmasi Pendaftaran, Invoice Tagihan, Kuitansi Lunas</strong> belum tersedia atau belum pernah dipicu.
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 bg-slate-50 rounded-xl max-w-sm mx-auto p-2 border border-slate-100">
                          💡 Tips: Perbarui profile Anda di tab &quot;Settings&quot; atau daftarkan diri Anda pada tournament baru untuk melihat simulasi email masuk secara real-time.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[580px] lg:h-[620px] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                        {/* Left Side List */}
                        <div className="w-full lg:w-[280px] xl:w-[320px] flex flex-col shrink-0">
                          <div className="p-4 border-b border-slate-100 bg-slate-50 text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex justify-between items-center shrink-0">
                            <span>Daftar Pesan ({myEmails.length})</span>
                            {unreadEmailsCount > 0 && (
                              <span className="bg-cyan-500 text-white px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-xs animate-pulse">
                                {unreadEmailsCount} BARU
                              </span>
                            )}
                          </div>
                          
                          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 h-[250px] lg:h-auto">
                            {myEmails.map((mail) => {
                              const isSelected = activeEmail?.id === mail.id;
                              let typeLabel = 'System';
                              let typeBg = 'bg-slate-50 border-slate-100 text-slate-600';
                              
                              if (mail.type === 'verification') {
                                typeLabel = 'Keamanan';
                                typeBg = 'bg-sky-50 border-sky-100 text-sky-700';
                              } else if (mail.type === 'registration') {
                                typeLabel = 'Registrasi';
                                typeBg = 'bg-emerald-50 border-emerald-100 text-emerald-700';
                              } else if (mail.type === 'invoice') {
                                typeLabel = 'Tagihan';
                                typeBg = 'bg-amber-50 border-amber-100 text-amber-700';
                              } else if (mail.type === 'receipt') {
                                typeLabel = 'Kuitansi';
                                typeBg = 'bg-teal-50 border-teal-100 text-teal-700';
                              }

                              return (
                                <div
                                  key={mail.id}
                                  onClick={() => {
                                    setSelectedEmailId(mail.id);
                                    markEmailAsRead(mail.id);
                                  }}
                                  className={`p-3.5 text-left transition-all cursor-pointer border-l-4 relative group ${
                                    isSelected 
                                      ? 'bg-slate-55 bg-slate-50 border-slate-900 shadow-3xs' 
                                      : 'border-transparent hover:bg-slate-50/40'
                                  }`}
                                >
                                  {/* Unread circle dot */}
                                  {!mail.read && (
                                    <span className="absolute right-3.5 top-5 h-2 w-2 rounded-full bg-cyan-500 shadow-sm" />
                                  )}
                                  
                                  <div className="flex items-center space-x-2 mb-1.5 pr-4">
                                    <span className={`rounded-md border px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider ${typeBg}`}>
                                      {typeLabel}
                                    </span>
                                    <span className="text-[9.5px] font-mono font-medium text-slate-400">
                                      {new Date(mail.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  
                                  <h4 className={`text-xs ${!mail.read ? 'font-bold text-slate-905 text-slate-900 pr-4' : 'font-medium text-slate-700'} line-clamp-1`}>
                                    {mail.subject}
                                  </h4>
                                  
                                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                    {mail.body.replace(/<[^>]*>/g, '').trim()}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right Side Mail detail screen */}
                        <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden">
                          {activeEmail ? (
                            <div className="flex-1 flex flex-col h-[320px] lg:h-auto overflow-hidden">
                              {/* Headers segment */}
                              <div className="p-5 border-b border-slate-100 bg-white shadow-3xs shrink-0 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-800">
                                    {activeEmail.subject}
                                  </h3>
                                  <button
                                    onClick={() => deleteEmail(activeEmail.id)}
                                    className="flex items-center space-x-1 border border-rose-100 bg-rose-50/50 hover:bg-rose-55 hover:border-rose-200 text-rose-600 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer self-start animate-fade-in"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Hapus</span>
                                  </button>
                                </div>

                                <div className="grid gap-1 border-t border-slate-100 pt-3 text-[10.5px] text-slate-550 text-slate-500 font-medium">
                                  <div className="flex">
                                    <span className="w-16 shrink-0 font-bold text-slate-400">PENGIRIM:</span>
                                    <span className="font-mono text-slate-800">noreply@eventhub.id (Sports Automation)</span>
                                  </div>
                                  <div className="flex">
                                    <span className="w-16 shrink-0 font-bold text-slate-400">KEPADA:</span>
                                    <span className="font-mono text-slate-800">{activeEmail.to}</span>
                                  </div>
                                  <div className="flex">
                                    <span className="w-16 shrink-0 font-bold text-slate-400">TANGGAL:</span>
                                    <span className="text-slate-850 font-mono">
                                      {new Date(activeEmail.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Body Frame segment */}
                              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 flex justify-center">
                                <div className="w-full max-w-[620px] rounded-2xl bg-white p-5 md:p-8 border border-slate-200/60 shadow-xs h-fit">
                                  <div dangerouslySetInnerHTML={{ __html: activeEmail.body }} />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center py-20 text-slate-405 text-slate-400">
                              Pilih pesan dari kotak masuk di kiri untuk membaca kontennya.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>

      {/* LAYERED CONFIRMATION OVERLAYS */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl text-center space-y-5 animate-in scale-in duration-300 border border-slate-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <AlertCircle className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-sans text-base font-extrabold text-slate-900">Apakah Anda benar-benar yakin?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan menghapus akun Anda beserta seluruh riwayat pendaftaran event, tiket QR, alokasi nomor BIB, e-kuitansi pembayaran, dan e-sertifikat yang telah dikonfirmasi secara permanen dari basis data sistem.
              </p>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteStep(2)}
                className="w-full rounded-xl bg-red-600 hover:bg-red-500 text-white font-sans text-xs font-bold py-3 transition-colors cursor-pointer"
                id="delete-step1-next"
              >
                Ya, Lanjutkan Konfirmasi (Langkah 1 dari 2)
              </button>
              <button
                type="button"
                onClick={() => { setDeleteStep(0); setConfirmPhraseInput(''); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-sans text-xs font-bold text-slate-700 py-3 transition-colors cursor-pointer"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteStep === 2 && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-205">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl text-center space-y-5 animate-in scale-in duration-305 border-2 border-red-500">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-650 animate-pulse">
              <ShieldAlert className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-sans text-base font-extrabold text-red-650">Konfirmasi Keamanan Terakhir</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penghapusan akun ini bersifat <strong>irreversible (tidak bisa dibatalkan)</strong>. Untuk melanjutkan, silakan ketik persis kalimat konfirmasi di bawah ini:
              </p>
              <p className="rounded-xl bg-slate-100 p-2.5 font-mono text-xs font-extrabold text-slate-800 select-all border border-slate-200">
                HAPUS AKUN SAYA PERMANEN
              </p>
            </div>

            <div className="space-y-3 pt-1 text-left">
              <input
                type="text"
                value={confirmPhraseInput}
                onChange={(e) => setConfirmPhraseInput(e.target.value)}
                placeholder="Ketik frase konfirmasi di sini"
                className="w-full rounded-xl border border-slate-200 focus:border-red-500 p-3 text-xs font-semibold text-slate-850 bg-white focus:outline-none transition-colors"
                id="delete-confirm-input"
              />
              
              <div className="flex flex-col space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteDeletion}
                  disabled={confirmPhraseInput !== 'HAPUS AKUN SAYA PERMANEN' || isDeletingUserPruning}
                  className="w-full rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-sans text-xs font-bold py-3 transition-all cursor-pointer disabled:cursor-not-allowed justify-center items-center flex space-x-1.5"
                  id="delete-step2-execute"
                >
                  {isDeletingUserPruning ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border border-slate-400 border-t-white" />
                      <span>Menghapus Data...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 shrink-0" />
                      <span>SAYA PAHAM, HAPUS AKUN SAYA SELAMANYA</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isDeletingUserPruning}
                  onClick={() => { setDeleteStep(0); setConfirmPhraseInput(''); }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 font-sans text-xs font-bold text-slate-705 text-slate-700 py-3 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Kembali ke Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
