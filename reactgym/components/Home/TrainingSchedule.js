import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const TrainingSchedule = () => {
  const [selectedPackage, setSelectedPackage] = useState("Gói A");
  const [selectedDays, setSelectedDays] = useState([]); // Thay đổi thành mảng

  const packages = [
    { label: "Gói A - Cơ bản", value: "Gói A" },
    { label: "Gói B - Nâng cao", value: "Gói B" },
    { label: "Gói C - Chuyên nghiệp", value: "Gói C" }
  ];

  const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

  // Hàm xử lý chọn/bỏ chọn ngày
  const toggleDay = (day) => {
    setSelectedDays(prevDays => {
      if (prevDays.includes(day)) {
        // Nếu ngày đã được chọn, bỏ chọn
        return prevDays.filter(d => d !== day);
      } else {
        // Nếu ngày chưa được chọn, thêm vào
        return [...prevDays, day];
      }
    });
  };

  // Hàm kiểm tra ngày có được chọn không
  const isDaySelected = (day) => {
    return selectedDays.includes(day);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Chọn gói tập:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPackage}
          onValueChange={(itemValue) => setSelectedPackage(itemValue)}
          style={styles.picker}
          mode="dropdown"
        >
          {packages.map((pkg, index) => (
            <Picker.Item
              key={index}
              label={pkg.label}
              value={pkg.value}
              style={styles.pickerItem}
            />
          ))}
        </Picker>
      </View>

      <Text style={[styles.label, styles.dayLabel]}>
        Chọn ngày tập (có thể chọn nhiều):
      </Text>

      {weekdays.map((day, index) => (
        <TouchableOpacity
          key={index}
          style={styles.checkboxContainer}
          onPress={() => toggleDay(day)}
        >
          <View style={[
            styles.checkbox,
            isDaySelected(day) && styles.checkboxSelected
          ]}>
            {isDaySelected(day) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          <Text style={[
            styles.dayText,
            isDaySelected(day) && styles.dayTextSelected
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Nút chọn tất cả / bỏ chọn tất cả */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setSelectedDays([...weekdays])}
        >
          <Text style={styles.actionButtonText}>Chọn tất cả</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={() => setSelectedDays([])}
        >
          <Text style={[styles.actionButtonText, styles.clearButtonText]}>
            Bỏ chọn tất cả
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          ✅ Gói đã chọn: {selectedPackage} {"\n"}
          📅 Ngày tập ({selectedDays.length} ngày): {
            selectedDays.length > 0
              ? selectedDays.join(", ")
              : "Chưa chọn"
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
  dayLabel: {
    marginTop: 20,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 5,
  },
  checkbox: {
    height: 24,
    width: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#444',
    borderColor: '#444',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  dayTextSelected: {
    color: '#444',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#444',
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default TrainingSchedule;

