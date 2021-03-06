import { Command } from "discord-akairo";
import { Message, GuildMember} from "discord.js";
import { Repository } from "typeorm";

import { Warns } from "../../models/Warns";

export default class WarnCommand extends Command {
    public constructor( ) {
        super("warn", {
            aliases: ["warn"],
            category: "Moderation Commands",
            description: {
                content: "Warn a person/member",
                usage: "warn [ Member ] < reason >",
                examples: [
                    "Warn @[Member] Racial slurs"
                ]
            },
            ratelimit: 3,
            userPermissions: ["MANAGE_MESSAGES"],
            args: [
                {
                    id: "member",
                    type: "member",
                    prompt: {
                        start: (msg: Message) => `${msg.author}, please provide a member to warn....`,
                        retry: (msg: Message) => `${msg.author}, Please privide a valid member to warn....`
                    }
                },
                {

                    id: "reason",
                    type: "string",
                    match: "rest",
                    default: "No reason provided"
                }
            ]
        })
    }

    public async exec(message: Message, { member, reason }: { member: GuildMember, reason: string}): Promise<Message> {
        const warnRepo: Repository<Warns> = this.client.db.getRepository(Warns);
        if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerID)
            return message.util.reply("this member is higher or equal role to you!");

        await warnRepo.insert({
            guild: message.guild.id,
            user: member.id,
            moderator: message.author.id,
            reason: reason
        })

        return message.util.send(`**${member.user.tag}** has been warned by **${message.author.tag}** for *${reason}*`)
    }
}