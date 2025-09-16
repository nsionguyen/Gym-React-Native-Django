import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/MyContexts"
const RegisterMemberPackage = () => {
    const user = useContext(MyUserContext)
    const { control, handleSubmit } = useForm();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const loadPackages = async () => {
            try {
                const res = await Apis.get(endpoints['packages']);
                setPackages(res.data);
            } catch (err) {
                console.error(err);
                Alert.alert("Lỗi", "Không tải được danh sách gói tập");
            } finally {
                setLoading(false);
            }
        };
        loadPackages();
    }, []);

    const onSubmit = async (data) => {
        try {
            const api = authApis(user.access_token);
            await api.post(endpoints['member-packages'], {
                package_id: 1
            });
            Alert.alert('Thành công', 'Đã đăng ký gói tập!');
        } catch (err) {
            console.error(err);
            Alert.alert('Thất bại', `${err}`);
        }
    };

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: 'bold' }}>
                Chọn gói tập
            </Text>

            <Controller
                control={control}
                name="package_id"
                defaultValue={packages[0]?.id || ''}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                    <Picker
                        selectedValue={value}
                        onValueChange={onChange}
                        style={{ marginBottom: 20 }}
                    >
                        {packages.map(pkg => (
                            <Picker.Item
                                key={pkg.id}
                                label={`${pkg.name} - ${pkg.price}k`}
                                value={pkg.id}
                            />
                        ))}
                    </Picker>
                )}
            />

            <Button title="Đăng ký gói tập" onPress={handleSubmit(onSubmit)} />
        </View>
    );

};

export default RegisterMemberPackage;