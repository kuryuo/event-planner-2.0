import {useState} from "react";
import Select from "@/ui/select/Select.tsx";
import {Card} from "@/ui/card/Card.tsx";

export default function Organizers() {
    const [inputValue, setInputValue] = useState("");

    return (
        <div>
            <Select
                label="Организаторы"
                placeholder="Выберите организатора"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                options={[
                    {
                        label: "Алексей Смирнов",
                        description: "Главный организатор",
                        content: (
                            <Card
                                title="Алексей Смирнов"
                                avatarUrl="https://randomuser.me/api/portraits/men/15.jpg"
                                size="S"
                            />
                        ),
                    },
                    {
                        label: "Мария Волкова",
                        description: "PR-менеджер",
                        content: (
                            <Card
                                title="Мария Волкова"
                                avatarUrl="https://randomuser.me/api/portraits/women/21.jpg"
                                size="S"
                            />
                        ),
                    },
                    {
                        label: "Дмитрий Орлов",
                        description: "Технический директор",
                        content: (
                            <Card
                                title="Дмитрий Орлов"
                                avatarUrl="https://randomuser.me/api/portraits/men/42.jpg"
                                size="S"
                            />
                        ),
                    },
                    {
                        label: "Екатерина Иванова",
                        description: "Координатор мероприятий",
                        content: (
                            <Card
                                title="Екатерина Иванова"
                                avatarUrl="https://randomuser.me/api/portraits/women/38.jpg"
                                size="S"
                            />
                        ),
                    },
                    {
                        label: "Илья Кузнецов",
                        description: "Дизайнер сцены",
                        content: (
                            <Card
                                title="Илья Кузнецов"
                                avatarUrl="https://randomuser.me/api/portraits/men/5.jpg"
                                size="S"
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
}
