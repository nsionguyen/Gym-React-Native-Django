import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Button, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/MyContexts";

const PackageList = () => {
    const user = useContext(MyUserContext);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPackages = async () => {
            try {
                const res = await Apis.get(endpoints['packages']);
                setPackages(res.data);
            } catch (err) {
                console.error(err);
                Alert.alert("Lỗi", "Không tải được gói tập.");
            } finally {
                setLoading(false);
            }
        };
        loadPackages();
    }, []);

    const handleRegister = async (package_id) => {
        try {
            await authApis(user.access_token).post(endpoints['member-packages'], {
                package_id
            });
            Alert.alert("Thành công", "Bạn đã đăng ký gói tập!");
        } catch (err) {
            console.error(err.response?.data || err);
            Alert.alert("Lỗi", "Không thể đăng ký gói tập.");
        }
    };

    const renderItem = ({ item }) => (
        <View style={{ padding: 16, marginBottom: 10, borderWidth: 1, borderRadius: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
            <Text>Giá: {item.price} vnđ</Text>
            <Text>Lợi ích: {item.description}</Text>
            <Text>Số buổi tập tối đa: {item.pt_sessions}</Text>


            <TouchableOpacity
                onPress={() => handleRegister(item.id)}
                style={{ marginTop: 10, backgroundColor: 'green', padding: 10, borderRadius: 5 }}
            >
                <Text style={{ color: 'white', textAlign: 'center' }}>Đăng ký</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <FlatList
            data={packages}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
        />
    );
};

export default PackageList;
