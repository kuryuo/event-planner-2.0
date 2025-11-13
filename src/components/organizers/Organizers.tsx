import {useState} from "react";
import Select from "@/ui/select/Select.tsx";
import {CardBase} from "@/ui/card/CardBase.tsx";

export default function Organizers() {
    const [inputValue, setInputValue] = useState("");

    return (
        <div>
            <Select
                label="Организаторы"
                placeholder="Введите имя организатора"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                options={[
                    {
                        label: "Алексей Смирнов",
                        description: "Главный организатор",
                        content: (
                            <CardBase
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
                            <CardBase
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
                            <CardBase
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
                            <CardBase
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
                            <CardBase
                                title="Илья Кузнецов"
                                subtitle="Дизайнер сцены"
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
