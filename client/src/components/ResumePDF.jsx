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
    sales: { primary: '#b91c1c', text: '#111827', accent: '#ef4444', bg: '#ffffff' },
    ats_pro: { primary: '#000000', text: '#222222', accent: '#000000', bg: '#ffffff' },
    ats_modern: { primary: '#000000', text: '#222222', accent: '#000000', bg: '#ffffff' }
  };
  const color = baseColors[templateId] || baseColors.classic;

  return StyleSheet.create({
    page: { 
      padding: templateId === 'sidebar' ? 0 : 30, 
      fontFamily: 'Helvetica', 
      fontSize: 10, 
      color: color.text, 
      lineHeight: 1.5,
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
    headerClassic: { marginBottom: 15, textAlign: 'center', alignItems: 'center', width: '100%' },
    headerExecutive: { marginBottom: 15, textAlign: 'center', alignItems: 'center', width: '100%' },
    headerModern: { marginBottom: 12, textAlign: 'left' },
    headerMinimal: { marginBottom: 20, textAlign: 'left' },
    headerGoogle: { marginBottom: 10, textAlign: 'left', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
    headerConsultant: { marginBottom: 15, textAlign: 'left' },
    headerIvy: { marginBottom: 20, textAlign: 'center', alignItems: 'center', width: '100%' },
    headerCreative: { marginBottom: 15, textAlign: 'left' },
    headerHealthcare: { marginBottom: 12, textAlign: 'left' },
    headerAts_pro: { marginBottom: 15, textAlign: 'center', alignItems: 'center', width: '100%' },
    headerAts_modern: { marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1.5, borderBottomColor: '#000', paddingBottom: 10 },
    
    nameClassic: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#000', textTransform: 'uppercase' },
    nameExecutive: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', color: color.primary },
    nameModern: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' },
    nameSidebar: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#ffffff' },
    nameMinimal: { fontSize: 26, fontWeight: 'light', marginBottom: 15, color: '#000' },
    nameGoogle: { fontSize: 20, fontWeight: 'bold', color: color.primary, marginBottom: 8 },
    nameConsultant: { fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', color: color.primary, marginBottom: 8 },
    nameIvy: { fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', color: '#000', marginBottom: 10 },
    nameCreative: { fontSize: 32, fontWeight: 'black', color: color.primary, letterSpacing: -1, marginBottom: 15 },
    nameHealthcare: { fontSize: 20, fontWeight: 'bold', color: color.primary, marginBottom: 10 },
    nameSales: { fontSize: 22, fontWeight: 'black', textTransform: 'uppercase', color: color.primary, marginBottom: 12 },
    nameAts_pro: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#000', textTransform: 'uppercase' },
    nameAts_modern: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
    
    subtitleModern: { fontSize: 12, color: '#666', marginBottom: 4 },
    subtitleMinimal: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
    
    contactClassic: { fontSize: 9, color: '#444', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
    contactExecutive: { fontSize: 9, color: '#555', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
    contactModern: { fontSize: 9, color: '#666', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10 },
    contactAts_pro: { fontSize: 9, color: '#000', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    contactAts_modern: { fontSize: 9, color: '#000', textAlign: 'right', gap: 2 },
    contactItem: { fontSize: 9, color: '#444' },

    summary: { marginBottom: 10, fontSize: 10 },
    
    sectionHeaderClassic: { 
      fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 8, 
      backgroundColor: '#EEEEEE', color: '#000000', paddingVertical: 3, paddingHorizontal: 6,
      textTransform: 'uppercase', width: '100%'
    },
    sectionHeaderExecutive: { 
      fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 8, 
      borderBottomWidth: 1, borderBottomColor: '#000', borderTopWidth: 1, borderTopColor: '#000',
      paddingVertical: 3, textTransform: 'uppercase', textAlign: 'left' 
    },
    sectionHeaderModern: { 
      fontSize: 11, fontWeight: 'bold', marginTop: 10, marginBottom: 6, 
      color: '#2563eb', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#dbeafe', paddingBottom: 2
    },
    sectionHeaderSidebar: {
      fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: color.primary, textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: color.primary, paddingBottom: 3
    },
    sectionHeaderMinimal: {
      fontSize: 10, fontWeight: 'bold', marginTop: 15, marginBottom: 8, color: '#000', textTransform: 'uppercase', letterSpacing: 1
    },
    sectionHeaderGoogle: {
      fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 6, color: '#1a73e8', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#f1f3f4', paddingBottom: 2
    },
    sectionHeaderConsultant: {
      fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 6, color: '#000', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 2
    },
    sectionHeaderIvy: {
      fontSize: 11, fontWeight: 'bold', marginTop: 10, marginBottom: 6, color: '#000', borderBottomColor: '#000', borderBottomWidth: 1, paddingBottom: 2, textTransform: 'uppercase', textAlign: 'center'
    },
    sectionHeaderCreative: {
      fontSize: 14, fontWeight: 'black', marginTop: 15, marginBottom: 8, color: color.primary, textTransform: 'lowercase'
    },
    sectionHeaderHealthcare: {
      fontSize: 11, fontWeight: 'bold', marginTop: 10, marginBottom: 6, color: color.primary, borderLeftWidth: 3, borderLeftColor: color.primary, paddingLeft: 6
    },
    sectionHeaderSales: {
      fontSize: 12, fontWeight: 'black', marginTop: 15, marginBottom: 8, color: '#fff', backgroundColor: color.primary, padding: 3, textTransform: 'uppercase'
    },
    sectionHeaderAts_pro: { 
      fontSize: 11, fontWeight: 'bold', marginTop: 8, marginBottom: 5, 
      backgroundColor: '#EEEEEE', color: '#000000', paddingVertical: 2, paddingHorizontal: 6,
      borderBottomWidth: 1, borderBottomColor: '#000000', textTransform: 'uppercase'
    },
    sectionHeaderAts_modern: { 
      fontSize: 11, fontWeight: 'bold', marginTop: 8, marginBottom: 5, 
      backgroundColor: '#F5F5F0', color: '#000000', paddingVertical: 2, paddingHorizontal: 6,
      textTransform: 'none'
    },

    // Layout blocks
    itemGroup: { marginBottom: 6 },
    row: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'baseline',
      marginBottom: 1 
    },
    titleContainer: { flex: 1, paddingRight: 10 },
    
    boldText: { fontWeight: 'bold' },
    italicText: { fontStyle: 'italic', fontWeight: 'bold', color: '#444', fontSize: 9, marginBottom: 1 },
    dateText: { fontSize: 9, color: '#555', textAlign: 'right', minWidth: 80 },
    
    bullet: { 
      flexDirection: 'row', 
      marginBottom: 1, 
      paddingLeft: templateId === 'sidebar' ? 0 : 8 
    },
    bulletPoint: { width: 10, fontSize: 10, marginRight: 2 },
    bulletText: { flex: 1, fontSize: 10, lineHeight: 1.5, textAlign: 'left' },

    skillsBlock: { marginTop: 12 },
    
    // Modern ATS Sidebar layout
    modernRow: { flexDirection: 'row', marginBottom: 8 },
    modernLeft: { width: '22%', paddingRight: 10, textAlign: 'right' },
    modernRight: { width: '78%', borderLeftWidth: 1.5, borderLeftColor: '#000000', paddingLeft: 12 },
    modernDate: { fontSize: 9, fontWeight: 'bold', color: '#666' },
    modernInstitution: { fontSize: 10, fontWeight: 'bold' }
  });
};

export const ResumePDF = ({ data, templateId = 'classic' }) => {
  if (!data) return null;
  
  const styles = getStyles(templateId);

  const contacts = [
    { label: '', value: data.personalInfo.email },
    { label: '', value: data.personalInfo.phone },
    { label: 'LinkedIn: ', value: data.personalInfo.linkedin ? data.personalInfo.linkedin.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '') : null },
    { label: 'GitHub: ', value: data.personalInfo.github ? data.personalInfo.github.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '') : null },
    { label: '', value: data.personalInfo.portfolio ? data.personalInfo.portfolio.replace(/^(https?:\/\/)?(www\.)?/, '') : null }
  ].filter(c => c.value);

  const renderContactInfo = () => {
    const headerStyle = styles[`contact${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.contactClassic;
    
    if (templateId === 'ats_modern') {
      return (
        <View style={headerStyle}>
          <Text style={styles.contactItem}>Phone : {data.personalInfo.phone}</Text>
          <Text style={styles.contactItem}>Email : {data.personalInfo.email}</Text>
          {data.personalInfo.linkedin && (
            <Text style={styles.contactItem}>LinkedIn : {data.personalInfo.linkedin.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '')}</Text>
          )}
        </View>
      );
    }

    return (
      <View style={headerStyle}>
        {contacts.map((c, i) => (
          <Text key={i} style={styles.contactItem}>
            {c.label}{c.value}{i < contacts.length - 1 && '    |    '}
          </Text>
        ))}
      </View>
    );
  };

  const renderSectionHeader = (title) => {
    const style = styles[`sectionHeader${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.sectionHeaderClassic;
    return <Text style={style}>{title}</Text>;
  };

  const renderItems = () => (
    <>
      {/* Summary - show only if NOT ats_modern as it is in header there */}
      {data.summary && templateId !== 'ats_modern' && (
        <View style={styles.summary}>
          {templateId !== 'modern' && templateId !== 'sidebar' && renderSectionHeader('PROFILE SUMMARY')}
          {templateId === 'sidebar' && renderSectionHeader('About Me')}
          <Text style={{ fontSize: templateId === 'sidebar' ? 9 : 10 }}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View>
          {renderSectionHeader(templateId === 'ats_modern' ? 'Internships & Trainings' : 'WORK EXPERIENCE')}
          {data.experience.map((exp, i) => (
            templateId === 'ats_modern' ? (
              <View key={i} style={styles.modernRow}>
                <View style={styles.modernLeft}>
                  <Text style={styles.modernDate}>{exp.startDate}{exp.endDate ? `-\n${exp.endDate}` : ''}</Text>
                </View>
                <View style={styles.modernRight}>
                  <Text style={styles.boldText}>{exp.jobTitle}, {exp.company}</Text>
                  {exp.description && exp.description.map((line, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{line}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View key={i} style={styles.itemGroup}>
                <View style={styles.row}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.boldText}>{exp.jobTitle.toUpperCase()}{templateId === 'sidebar' ? ` @ ${exp.company}` : ''}</Text>
                  </View>
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
            )
          ))}
        </View>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <View>
          {renderSectionHeader('PROJECTS')}
          {data.projects.map((proj, i) => (
            templateId === 'ats_modern' ? (
              <View key={i} style={styles.modernRow}>
                <View style={styles.modernLeft}>
                  <Text style={styles.modernDate}>{proj.title}</Text>
                </View>
                <View style={styles.modernRight}>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <Text style={{ fontSize: 8, color: '#444', marginBottom: 2 }}>Tech: {proj.technologies.join(', ')}</Text>
                  )}
                  {proj.description && proj.description.map((line, j) => (
                    <View key={j} style={styles.bullet}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{line}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View key={i} style={styles.itemGroup}>
                <View style={styles.row}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.boldText}>{proj.title}</Text>
                  </View>
                  <Text style={[styles.dateText, {fontSize: 8, color: '#3b82f6'}]}>
                    {proj.link ? (proj.link.length > 30 ? proj.link.substring(0, 27) + "..." : proj.link) : ""}
                  </Text>
                </View>
                {proj.technologies && proj.technologies.length > 0 && (
                  <Text style={{ fontSize: 8, color: '#555', marginBottom: 2, fontStyle: 'italic' }}>Technologies: {proj.technologies.join(', ')}</Text>
                )}
                {proj.description && proj.description.map((line, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            )
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View>
          {renderSectionHeader('EDUCATION')}
          {data.education.map((edu, i) => (
            templateId === 'ats_modern' ? (
              <View key={i} style={styles.modernRow}>
                <View style={styles.modernLeft}>
                  <Text style={styles.modernDate}>{edu.graduationYear}</Text>
                </View>
                <View style={styles.modernRight}>
                  <Text style={styles.boldText}>{edu.institution}</Text>
                  <Text style={{ fontSize: 9 }}>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</Text>
                  {edu.gpa && <Text style={{ fontSize: 9 }}>CGPA - {edu.gpa}</Text>}
                </View>
              </View>
            ) : (
              <View key={i} style={styles.itemGroup}>
                <View style={styles.row}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.boldText}>{edu.institution}</Text>
                  </View>
                  <Text style={styles.dateText}>{edu.graduationYear}</Text>
                </View>
                <Text style={{ fontSize: 9 }}>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`} {edu.gpa && `| GPA: ${edu.gpa}`}</Text>
              </View>
            )
          ))}
        </View>
      )}
      
      {/* Certifications / Skills specifically for ats_modern */}
      {templateId === 'ats_modern' && data.skills && data.skills.length > 0 && (
        <View>
          {renderSectionHeader('TECHNICAL SKILLS')}
          <View style={styles.modernRow}>
            <View style={styles.modernLeft}>
              <Text style={styles.modernDate}>Skills</Text>
            </View>
            <View style={styles.modernRight}>
              <Text style={{ fontSize: 9 }}>{data.skills.join(', ')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Legacy/Standard fields */}
      {templateId !== 'ats_modern' && (
        <>
          {data.certifications && data.certifications.length > 0 && (
            <View>
              {renderSectionHeader('CERTIFICATIONS')}
              {data.certifications.map((cert, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{cert}</Text>
                </View>
              ))}
            </View>
          )}

          {data.achievements && data.achievements.length > 0 && (
            <View>
              {renderSectionHeader('ACHIEVEMENTS')}
              {data.achievements.map((ach, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{ach}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {templateId === 'ats_modern' && (
        <View>
          {renderSectionHeader('ADDITIONAL INFORMATION')}
          {data.certifications && data.certifications.length > 0 && (
            <View style={styles.modernRow}>
              <View style={styles.modernLeft}>
                <Text style={styles.modernDate}>Certifications</Text>
              </View>
              <View style={styles.modernRight}>
                <Text style={{ fontSize: 9 }}>{data.certifications.join(', ')}</Text>
              </View>
            </View>
          )}
          {data.achievements && data.achievements.map((ach, i) => (
            <View key={i} style={styles.modernRow}>
              <View style={styles.modernLeft}>
                <Text style={styles.modernDate}>Award/Info</Text>
              </View>
              <View style={styles.modernRight}>
                <Text style={{ fontSize: 9 }}>{ach}</Text>
              </View>
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
        {/* Normal Layouts Header */}
        <View style={styles[`header${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.headerClassic}>
          {(templateId === 'ats_modern' || templateId === 'google') ? (
            <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles[`name${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.nameClassic}>
                  {data.personalInfo.fullName}
                </Text>
                {templateId === 'ats_modern' && data.summary && (
                  <Text style={{ fontSize: 9, color: '#333', marginTop: 2 }}>{data.summary.substring(0, 150)}...</Text>
                )}
              </View>
              <View>
                {renderContactInfo()}
              </View>
            </View>
          ) : (
            <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center' }}>
              <Text style={styles[`name${templateId.charAt(0).toUpperCase() + templateId.slice(1)}`] || styles.nameClassic}>
                {data.personalInfo.fullName}
              </Text>
              <View style={{ height: 4 }} /> 
              {renderContactInfo()}
            </View>
          )}
        </View>

        {renderItems()}

        {/* Normal Layout Bottom Section for Skills if and only if NOT sidebar/ats_modern */}
        {data.skills && data.skills.length > 0 && templateId !== 'sidebar' && templateId !== 'ats_modern' && (
          <View style={styles.skillsBlock}>
            {renderSectionHeader('SKILLS')}
            <Text>{data.skills.join(' • ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
