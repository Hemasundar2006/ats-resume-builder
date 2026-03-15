import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const getStyles = (templateId) => {
  const baseColors = {
    classic: { primary: '#000000', text: '#222222', accent: '#000000', bg: '#ffffff' },
    executive: { primary: '#000000', text: '#333333', accent: '#000000', bg: '#ffffff' },
    modern: { primary: '#2563eb', text: '#374151', accent: '#60a5fa', bg: '#ffffff' },
    sidebar: { primary: '#1e293b', text: '#334155', accent: '#3b82f6', bg: '#f8fafc' },
    academic: { primary: '#000000', text: '#111111', accent: '#000000', bg: '#ffffff' },
    minimal: { primary: '#000000', text: '#4b5563', accent: '#9ca3af', bg: '#ffffff' },
    google: { primary: '#1a73e8', text: '#3c4043', accent: '#1a73e8', bg: '#ffffff' },
    consultant: { primary: '#051c2c', text: '#333333', accent: '#0a3d62', bg: '#ffffff' },
    ivy: { primary: '#000000', text: '#000000', accent: '#000000', bg: '#ffffff' },
    creative: { primary: '#d97706', text: '#1f2937', accent: '#f59e0b', bg: '#ffffff' },
    healthcare: { primary: '#0891b2', text: '#0e7490', accent: '#22d3ee', bg: '#ffffff' },
    sales: { primary: '#b91c1c', text: '#111827', accent: '#ef4444', bg: '#ffffff' }
  };
  const color = baseColors[templateId] || baseColors.classic;

  return StyleSheet.create({
    page: { 
      padding: templateId === 'sidebar' ? 0 : 40, 
      fontFamily: 'Helvetica', 
      fontSize: 10, 
      color: color.text, 
      lineHeight: 1.4,
      backgroundColor: '#ffffff'
    },
    // Sidebar Specific
    container: { flexDirection: 'row', height: '100%' },
    sidebar: { width: '30%', backgroundColor: color.primary, color: '#ffffff', padding: 30 },
    mainContent: { width: '70%', padding: 30 },
    sidebarSection: { marginBottom: 20 },
    sidebarHeader: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ffffff44', paddingBottom: 4, textTransform: 'uppercase' },
    sidebarText: { fontSize: 9, marginBottom: 4, opacity: 0.9 },

    // Headers
    headerClassic: { marginBottom: 15, textAlign: 'left' },
    headerExecutive: { marginBottom: 20, textAlign: 'center' },
    headerModern: { marginBottom: 15, textAlign: 'left' },
    headerMinimal: { marginBottom: 25, textAlign: 'left' },
    headerGoogle: { marginBottom: 10, textAlign: 'left', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    headerConsultant: { marginBottom: 20, textAlign: 'left' },
    headerIvy: { marginBottom: 25, textAlign: 'center' },
    headerCreative: { marginBottom: 20, textAlign: 'left' },
    headerHealthcare: { marginBottom: 15, textAlign: 'left' },
    headerSales: { marginBottom: 15, textAlign: 'left' },
    
    nameClassic: { fontSize: 24, fontWeight: 'bold', marginBottom: 2, color: color.primary },
    nameExecutive: { fontSize: 20, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', color: color.primary },
    nameModern: { fontSize: 26, fontWeight: 'bold', marginBottom: 2, color: color.primary },
    nameSidebar: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#ffffff' },
    nameMinimal: { fontSize: 28, fontWeight: 'light', marginBottom: 5, color: '#000' },
    nameGoogle: { fontSize: 22, fontWeight: 'bold', color: color.primary },
    nameConsultant: { fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', color: color.primary },
    nameIvy: { fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', color: '#000' },
    nameCreative: { fontSize: 30, fontWeight: 'black', color: color.primary, letterSpacing: -1 },
    nameHealthcare: { fontSize: 22, fontWeight: 'bold', color: color.primary },
    nameSales: { fontSize: 24, fontWeight: 'black', textTransform: 'uppercase', color: color.primary },
    
    subtitleModern: { fontSize: 12, color: '#666', marginBottom: 4 },
    subtitleMinimal: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
    
    contactClassic: { fontSize: 9, color: '#444' },
    contactExecutive: { fontSize: 9, color: '#555', textAlign: 'center' },
    contactModern: { fontSize: 9, color: '#666' },

    summary: { marginBottom: 15, fontSize: 10 },
    
    sectionHeaderClassic: { 
      fontSize: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 8, 
      borderBottomWidth: 1.5, borderBottomColor: '#000', paddingBottom: 3, textTransform: 'uppercase' 
    },
    sectionHeaderExecutive: { 
      fontSize: 11, fontWeight: 'bold', marginTop: 14, marginBottom: 10, 
      borderBottomWidth: 1, borderBottomColor: '#000', borderTopWidth: 1, borderTopColor: '#000',
      paddingVertical: 4, textTransform: 'uppercase', textAlign: 'left' 
    },
    sectionHeaderModern: { 
      fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 8, 
      color: color.primary, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#3b82f6', paddingBottom: 2
    },
    sectionHeaderSidebar: {
      fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: color.primary, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: color.primary, paddingBottom: 4
    },
    sectionHeaderMinimal: {
      fontSize: 10, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#000', textTransform: 'uppercase', letterSpacing: 1
    },
    sectionHeaderGoogle: {
      fontSize: 10, fontWeight: 'bold', marginTop: 12, marginBottom: 6, color: color.primary, textTransform: 'uppercase'
    },
    sectionHeaderConsultant: {
      fontSize: 10, fontWeight: 'bold', marginTop: 12, marginBottom: 6, color: '#000', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 2
    },
    sectionHeaderIvy: {
      fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#000', borderBottomColor: '#000', borderBottomWidth: 1, paddingBottom: 2, textTransform: 'uppercase', textAlign: 'center'
    },
    sectionHeaderCreative: {
      fontSize: 14, fontWeight: 'black', marginTop: 15, marginBottom: 10, color: color.primary, textTransform: 'lowercase'
    },
    sectionHeaderHealthcare: {
      fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 6, color: color.primary, borderLeftWidth: 3, borderLeftColor: color.primary, paddingLeft: 6
    },
    sectionHeaderSales: {
      fontSize: 12, fontWeight: 'black', marginTop: 15, marginBottom: 8, color: '#fff', backgroundColor: color.primary, padding: 4, textTransform: 'uppercase'
    },

    // Layout blocks
    itemGroup: { marginBottom: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    leftCol: { flex: 1, paddingRight: 15 },
    
    boldText: { fontWeight: 'bold' },
    italicText: { fontStyle: 'italic', color: '#444' },
    dateText: { fontSize: 9, color: '#555', flexShrink: 0 },
    
    bullet: { flexDirection: 'row', marginBottom: 3, paddingLeft: templateId === 'sidebar' ? 0 : 12 },
    bulletPoint: { width: 10, fontSize: 10 },
    bulletText: { flex: 1, fontSize: 10 },

    skillsBlock: { marginTop: 4 }
  });
};

export const ResumePDF = ({ data, templateId = 'classic' }) => {
  if (!data) return null;
  
  const styles = getStyles(templateId);

  const contacts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.linkedin,
    data.personalInfo.github,
    data.personalInfo.portfolio
  ].filter(Boolean);

  const contactString = contacts.join(templateId === 'modern' ? ' • ' : ' | ');

  const renderSectionHeader = (title) => {
    const style = styles[`sectionHeader${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.sectionHeaderClassic;
    return <Text style={style}>{title}</Text>;
  };

  const renderItems = () => (
    <>
      {/* Summary */}
      {data.summary && (
        <View style={styles.summary}>
          {templateId !== 'modern' && templateId !== 'sidebar' && renderSectionHeader('PROFILE SUMMARY')}
          {templateId === 'sidebar' && renderSectionHeader('About Me')}
          <Text style={{ fontSize: templateId === 'sidebar' ? 9 : 10 }}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View>
          {renderSectionHeader('WORK EXPERIENCE')}
          {data.experience.map((exp, i) => (
            <View key={i} style={styles.itemGroup}>
              <View style={styles.row}>
                <Text style={styles.boldText}>{exp.jobTitle}{templateId === 'sidebar' ? ` @ ${exp.company}` : ''}</Text>
                <Text style={styles.dateText}>{exp.startDate} {exp.startDate && exp.endDate && '—'} {exp.endDate}</Text>
              </View>
              {templateId !== 'sidebar' && <Text style={styles.italicText}>{exp.company}</Text>}
              {exp.description && exp.description.map((line, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <View>
          {renderSectionHeader('PROJECTS')}
          {data.projects.map((proj, i) => (
            <View key={i} style={styles.itemGroup}>
              <View style={styles.row}>
                <Text style={styles.boldText}>{proj.title}</Text>
                <Text style={styles.dateText}>{proj.link}</Text>
              </View>
              {proj.description && proj.description.map((line, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View>
          {renderSectionHeader('EDUCATION')}
          {data.education.map((edu, i) => (
            <View key={i} style={styles.itemGroup}>
              <View style={styles.row}>
                <Text style={styles.boldText}>{edu.institution}</Text>
                <Text style={styles.dateText}>{edu.graduationYear}</Text>
              </View>
              <Text>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  if (templateId === 'sidebar') {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.container}>
            {/* Sidebar Left */}
            <View style={styles.sidebar}>
              <Text style={styles.nameSidebar}>{data.personalInfo.fullName}</Text>
              
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarHeader}>Contact</Text>
                {contacts.map((c, i) => <Text key={i} style={styles.sidebarText}>{c}</Text>)}
              </View>

              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarHeader}>Skills</Text>
                {data.skills.map((s, i) => <Text key={i} style={styles.sidebarText}>• {s}</Text>)}
              </View>

              {data.certifications.length > 0 && (
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarHeader}>Certs</Text>
                  {data.certifications.map((c, i) => <Text key={i} style={styles.sidebarText}>• {c}</Text>)}
                </View>
              )}
            </View>

            {/* Main Content Right */}
            <View style={styles.mainContent}>
              {renderItems()}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Normal Layouts */}
        <View style={styles[`header${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.headerClassic}>
          <Text style={styles[`name${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.nameClassic}>
            {data.personalInfo.fullName}
          </Text>
          <Text style={styles[`contact${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.contactClassic}>
            {contactString}
          </Text>
        </View>

        {renderItems()}

        {/* Normal Layout Bottom Section for Skills if and only if NOT sidebar */}
        {data.skills && data.skills.length > 0 && templateId !== 'sidebar' && (
          <View style={styles.skillsBlock}>
            {renderSectionHeader('SKILLS')}
            <Text>{data.skills.join(' • ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
