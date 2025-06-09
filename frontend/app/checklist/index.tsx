import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getChecklistByContractId } from '../../api/checklist';
import ExamineButton from '../../components/ExamineButton';

interface ChecklistItem {
    title: string;
    details: string[];
    action?: string;
}

interface ChecklistSection {
    section: string;
    items: ChecklistItem[];
}

export default function ChecklistScreen() {
    const [checklistData, setChecklistData] = useState<ChecklistSection[]>([]);
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchChecklist = async () => {
            try {
                const data: ChecklistSection[] = await getChecklistByContractId(1);
                setChecklistData(data);

                // 첫 번째 섹션만 펼치도록 설정
                const initialExpanded: Record<number, boolean> = {};
                data.forEach((_, idx) => {
                    initialExpanded[idx] = idx === 0;
                });
                setExpandedSections(initialExpanded);
            } catch (error) {
                console.error('체크리스트 불러오기 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChecklist();
    }, []);

    const toggleSection = (index: number) => {
        setExpandedSections((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6883DE" />
                <Text style={{ marginTop: 10 }}>불러오는 중...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {checklistData.map((section, sectionIdx) => (
                <View key={sectionIdx}>
                    {/* 대제목 */}
                    <TouchableOpacity onPress={() => toggleSection(sectionIdx)} style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{section.section}</Text>
                        <Text style={styles.arrow}>{expandedSections[sectionIdx] ? '▾' : '▸'}</Text>
                    </TouchableOpacity>

                    {/* 본문 */}
                    {expandedSections[sectionIdx] && section.items.length > 0 && (
                        <View style={styles.timelineWrapper}>
                            <View style={styles.verticalLine} />
                            {section.items.map((item, itemIdx) => (
                                <View key={itemIdx}>
                                    <View style={styles.timelineRow}>
                                        <View style={styles.circle}>
                                            <Text style={styles.circleText}>{itemIdx + 1}</Text>
                                        </View>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                    </View>
                                    {item.details.map((detail, detailIdx) => (
                                        <View key={detailIdx} style={styles.detailRow}>
                                            <Text style={styles.detailText}>{detail}</Text>
                                            {detail === '표준계약서 사용' && <ExamineButton />}
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* 구분선 */}
                    <View style={styles.divider} />
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    arrow: {
        fontSize: 18,
        color: '#999',
    },
    divider: {
        width: '100%',
        height: 8,
        backgroundColor: '#F7F7F7',
        marginTop: 16,
        marginBottom: 16,
    },
    timelineWrapper: {
        position: 'relative',
        paddingLeft: 24,
    },
    verticalLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 37,
        width: 2,
        backgroundColor: '#6883DE',
        zIndex: -1,
    },
    timelineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    circle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderColor: '#6883DE',
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginRight: 10,
    },
    circleText: {
        color: '#6883DE',
        fontWeight: '500',
        fontSize: 16,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 6,
    },
    detailText: {
        fontSize: 14,
        marginLeft: 44,
        marginBottom: 14,
        color: '#000',
    },
    actionText: {
        fontSize: 12,
        textDecorationLine: 'underline',
        color: '#6883DE',
        marginLeft: 44,
        marginTop: 6,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    debuasdsadgger: {
        backgroundAttachment: 'Redirect',
    },
});
